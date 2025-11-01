import os
from dotenv import load_dotenv
from web3 import Web3
from neo4j import GraphDatabase

load_dotenv()

# --- Configuration ---
INFURA_PROJECT_ID = os.getenv("INFURA_PROJECT_ID")
NEO4J_URI = os.getenv("NEO4J_LOCAL_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_LOCAL_PASSWORD")
TRANSACTION_COUNT = int(os.getenv("TRANSACTION_COUNT"))

# --- ETHEREUM CONNECTION ---
w3 = Web3(Web3.HTTPProvider(f'https://mainnet.infura.io/v3/{INFURA_PROJECT_ID}'))
if not w3.is_connected():
    print("Failed to connect to Ethereum node.")
    exit(1)

# --- NEO4J CONNECTION ---
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
driver.verify_connectivity()

def init_db(driver):
    with driver.session() as session:
        # Delete all nodes and relationships
        session.run("MATCH (n) DETACH DELETE n")
        print("Neo4j database wiped (all nodes and relationships deleted).")
        # Optionally, recreate constraints/indexes
        session.run("""
        CREATE CONSTRAINT address_unique IF NOT EXISTS
        FOR (a:Address)
        REQUIRE a.address IS UNIQUE
        """)
        print("Neo4j constraints/indexes reset.")

def save_transaction(tx, driver, timestamp):
    from_addr = tx['from']
    to_addr = tx['to']
    tx_hash = tx['hash'].hex()
    value = tx['value']
    block_number = tx['blockNumber']
    gas = tx['gas']
    gas_price = tx['gasPrice']
    nonce = tx['nonce']
    transaction_index = tx['transactionIndex']

    with driver.session() as session:
        session.run("""
        MERGE (from:Address {address: $from})
        MERGE (to:Address {address: $to})
        CREATE (from)-[:SENT {
            hash: $hash,
            value: $value,
            block: $block_number,
            timestamp: $timestamp,
            gas: $gas,
            gas_price: $gas_price,
            nonce: $nonce,
            transaction_index: $transaction_index
        }]->(to)
        """, {
            "from": from_addr,
            "to": to_addr,
            "hash": tx_hash,
            "value": str(value),        # Store value as string!
            "block_number": block_number,
            "timestamp": timestamp,
            "gas": gas,
            "gas_price": gas_price,
            "nonce": nonce,
            "transaction_index": transaction_index
        })

def main():
    init_db(driver)

    cur_block = w3.eth.block_number
    print(f"Fetching transactions from block {cur_block} downwards...")
    total_tx_downloaded = 0
    block_count = 0

    while True:
        block = w3.eth.get_block(cur_block, full_transactions=True)
        transactions = block.transactions
        txs_in_block = [tx for tx in transactions if tx['to'] is not None]
        print(f"Block {cur_block} | Transactions to download: {len(txs_in_block)}")

        for tx in txs_in_block:
            save_transaction(tx, driver, block.timestamp)
            total_tx_downloaded += 1
            if total_tx_downloaded >= TRANSACTION_COUNT:
                break
            print(f"Downloaded {total_tx_downloaded} transactions", end='\r')

        cur_block -= 1
        block_count += 1

        if total_tx_downloaded >= TRANSACTION_COUNT:
            break

    print(f"\nDone. Downloaded {total_tx_downloaded} transactions from {block_count} blocks.")

if __name__ == "__main__":
    main()
    driver.close()