// import { GraphQLService } from '../services/graphql.service';

// describe('GraphQLService', () => {
//   let graphqlService: GraphQLService;

//   beforeAll(() => {
//     graphqlService = new GraphQLService();
//   });

//   describe('executeGraphQLQuery', () => {
//     it('should execute a checkDirectConnection query', async () => {
//       const query = `
//         query {
//           checkDirectConnection(
//             fromAddress: "0x1234567890123456789012345678901234567890",
//             toAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
//           )
//         }
//       `;

//       const result = await graphqlService.executeGraphQLQuery(query);

//       expect(result).toHaveProperty('checkDirectConnection');
//       expect(typeof result.checkDirectConnection).toBe('boolean');
//     });

//     it('should execute an addressInfo query', async () => {
//       const query = `
//         query {
//           addressInfo(address: "0x1234567890123456789012345678901234567890")
//         }
//       `;

//       const result = await graphqlService.executeGraphQLQuery(query);

//       expect(result).toHaveProperty('addressInfo');
//     });
//   });
// });
