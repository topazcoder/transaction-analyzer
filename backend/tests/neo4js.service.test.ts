// import { Neo4jService } from '../services/neo4j.service';

// describe('Neo4jService', () => {
//   let neo4jService: Neo4jService;

//   beforeAll(() => {
//     neo4jService = new Neo4jService();
//   });

//   describe('healthCheck', () => {
//     it('should return true when Neo4j is connected', async () => {
//       const isHealthy = await neo4jService.healthCheck();
//       expect(typeof isHealthy).toBe('boolean');
//     });
//   });

//   describe('checkDirectConnection', () => {
//     it('should check if two addresses are directly connected', async () => {
//       const fromAddress = '0x1234567890123456789012345678901234567890';
//       const toAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

//       const result = await neo4jService.checkDirectConnection(fromAddress, toAddress);

//       expect(typeof result).toBe('boolean');
//     });
//   });

//   describe('getAddressInfo', () => {
//     it('should return address information', async () => {
//       const address = '0x1234567890123456789012345678901234567890';

//       const info = await neo4jService.getAddressInfo(address);

//       if (info) {
//         expect(info).toHaveProperty('address');
//         expect(info).toHaveProperty('sentCount');
//         expect(info).toHaveProperty('receivedCount');
//       }
//     });
//   });
// });
