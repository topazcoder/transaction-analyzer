// import { ClaudeService } from '../services/claude.service';
// import { QueryIntent } from '../utils/claude.helpers';

// describe('ClaudeService', () => {
//   let claudeService: ClaudeService;

//   beforeAll(() => {
//     claudeService = new ClaudeService();
//   });

//   describe('parseNaturalLanguageToGraphQL', () => {
//     it('should parse a simple connection query', async () => {
//       const prompt = 'Are addresses 0x1234567890123456789012345678901234567890 and 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd connected?';

//       const result = await claudeService.parseNaturalLanguageToGraphQL(prompt);

//       expect(result).toHaveProperty('graphqlQuery');
//       expect(result).toHaveProperty('explanation');
//       expect(result).toHaveProperty('parameters');
//       expect(result.intent).toBe(QueryIntent.CHECK_CONNECTION);
//     }, 30000);

//     it('should extract addresses from prompt', async () => {
//       const prompt = 'Show transactions to 0x1234567890123456789012345678901234567890';

//       const result = await claudeService.parseNaturalLanguageToGraphQL(prompt);

//       expect(result.parameters.addresses).toContain('0x1234567890123456789012345678901234567890');
//     }, 30000);
//   });

//   describe('explainResults', () => {
//     it('should explain query results', async () => {
//       const query = 'Get transactions to address';
//       const results = [
//         { hash: '0xabc...', value: 1.5, timestamp: 1234567890 },
//         { hash: '0xdef...', value: 2.3, timestamp: 1234567900 },
//       ];

//       const explanation = await claudeService.explainResults(query, results);

//       expect(explanation).toBeTruthy();
//       expect(typeof explanation).toBe('string');
//       expect(explanation.length).toBeGreaterThan(10);
//     }, 30000);
//   });

//   describe('validateAndOptimizeQuery', () => {
//     it('should validate a correct query', async () => {
//       const query = 'query { addressInfo(address: "0x123...") { address sentCount } }';

//       const result = await claudeService.validateAndOptimizeQuery(query);

//       expect(result).toHaveProperty('valid');
//       expect(result).toHaveProperty('issues');
//       expect(result).toHaveProperty('suggestions');
//     }, 30000);
//   });
// });
