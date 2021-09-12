using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Numerics;
using Nethereum.Hex.HexTypes;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.Web3;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Contracts.CQS;
using Nethereum.Contracts.ContractHandlers;
using Nethereum.Contracts;
using System.Threading;
using Cultesale.Contracts.CulteSale.ContractDefinition;

namespace Cultesale.Contracts.CulteSale
{
    public partial class CulteSaleService
    {
        public static Task<TransactionReceipt> DeployContractAndWaitForReceiptAsync(Nethereum.Web3.Web3 web3, CulteSaleDeployment culteSaleDeployment, CancellationTokenSource cancellationTokenSource = null)
        {
            return web3.Eth.GetContractDeploymentHandler<CulteSaleDeployment>().SendRequestAndWaitForReceiptAsync(culteSaleDeployment, cancellationTokenSource);
        }

        public static Task<string> DeployContractAsync(Nethereum.Web3.Web3 web3, CulteSaleDeployment culteSaleDeployment)
        {
            return web3.Eth.GetContractDeploymentHandler<CulteSaleDeployment>().SendRequestAsync(culteSaleDeployment);
        }

        public static async Task<CulteSaleService> DeployContractAndGetServiceAsync(Nethereum.Web3.Web3 web3, CulteSaleDeployment culteSaleDeployment, CancellationTokenSource cancellationTokenSource = null)
        {
            var receipt = await DeployContractAndWaitForReceiptAsync(web3, culteSaleDeployment, cancellationTokenSource);
            return new CulteSaleService(web3, receipt.ContractAddress);
        }

        protected Nethereum.Web3.Web3 Web3{ get; }

        public ContractHandler ContractHandler { get; }

        public CulteSaleService(Nethereum.Web3.Web3 web3, string contractAddress)
        {
            Web3 = web3;
            ContractHandler = web3.Eth.GetContractHandler(contractAddress);
        }

        public Task<BigInteger> StartDateQueryAsync(StartDateFunction startDateFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<StartDateFunction, BigInteger>(startDateFunction, blockParameter);
        }

        
        public Task<BigInteger> StartDateQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<StartDateFunction, BigInteger>(null, blockParameter);
        }

        public Task<BigInteger> DurationQueryAsync(DurationFunction durationFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<DurationFunction, BigInteger>(durationFunction, blockParameter);
        }

        
        public Task<BigInteger> DurationQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<DurationFunction, BigInteger>(null, blockParameter);
        }

        public Task<BigInteger> CliffQueryAsync(CliffFunction cliffFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<CliffFunction, BigInteger>(cliffFunction, blockParameter);
        }

        
        public Task<BigInteger> CliffQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<CliffFunction, BigInteger>(null, blockParameter);
        }

        public Task<bool> PostponedQueryAsync(PostponedFunction postponedFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<PostponedFunction, bool>(postponedFunction, blockParameter);
        }

        
        public Task<bool> PostponedQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<PostponedFunction, bool>(null, blockParameter);
        }

        public Task<string> BeneficiaryQueryAsync(BeneficiaryFunction beneficiaryFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<BeneficiaryFunction, string>(beneficiaryFunction, blockParameter);
        }

        
        public Task<string> BeneficiaryQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<BeneficiaryFunction, string>(null, blockParameter);
        }

        public Task<BigInteger> GetCulteAmountQueryAsync(GetCulteAmountFunction getCulteAmountFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<GetCulteAmountFunction, BigInteger>(getCulteAmountFunction, blockParameter);
        }

        
        public Task<BigInteger> GetCulteAmountQueryAsync(BigInteger bnbAmount, SalesPhase salesPhase, BlockParameter blockParameter = null)
        {
            var getCulteAmountFunction = new GetCulteAmountFunction();
                getCulteAmountFunction.BnbAmount = bnbAmount;
                getCulteAmountFunction.SalesPhase = salesPhase;
            
            return ContractHandler.QueryAsync<GetCulteAmountFunction, BigInteger>(getCulteAmountFunction, blockParameter);
        }

        public Task<string> WalletQueryAsync(WalletFunction walletFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<WalletFunction, string>(walletFunction, blockParameter);
        }

        
        public Task<string> WalletQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<WalletFunction, string>(null, blockParameter);
        }

        public Task<string> CLTQueryAsync(CLTFunction cLTFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<CLTFunction, string>(cLTFunction, blockParameter);
        }

        
        public Task<string> CLTQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<CLTFunction, string>(null, blockParameter);
        }

        public Task<string> PostponeSaleRequestAsync(PostponeSaleFunction postponeSaleFunction)
        {
             return ContractHandler.SendRequestAsync(postponeSaleFunction);
        }

        public Task<string> PostponeSaleRequestAsync()
        {
             return ContractHandler.SendRequestAsync<PostponeSaleFunction>();
        }

        public Task<TransactionReceipt> PostponeSaleRequestAndWaitForReceiptAsync(PostponeSaleFunction postponeSaleFunction, CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync(postponeSaleFunction, cancellationToken);
        }

        public Task<TransactionReceipt> PostponeSaleRequestAndWaitForReceiptAsync(CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync<PostponeSaleFunction>(null, cancellationToken);
        }

        public Task<string> RenounceOwnershipRequestAsync(RenounceOwnershipFunction renounceOwnershipFunction)
        {
             return ContractHandler.SendRequestAsync(renounceOwnershipFunction);
        }

        public Task<string> RenounceOwnershipRequestAsync()
        {
             return ContractHandler.SendRequestAsync<RenounceOwnershipFunction>();
        }

        public Task<TransactionReceipt> RenounceOwnershipRequestAndWaitForReceiptAsync(RenounceOwnershipFunction renounceOwnershipFunction, CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync(renounceOwnershipFunction, cancellationToken);
        }

        public Task<TransactionReceipt> RenounceOwnershipRequestAndWaitForReceiptAsync(CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync<RenounceOwnershipFunction>(null, cancellationToken);
        }

        public Task<string> ReleaseRequestAsync(ReleaseFunction releaseFunction)
        {
             return ContractHandler.SendRequestAsync(releaseFunction);
        }

        public Task<string> ReleaseRequestAsync()
        {
             return ContractHandler.SendRequestAsync<ReleaseFunction>();
        }

        public Task<TransactionReceipt> ReleaseRequestAndWaitForReceiptAsync(ReleaseFunction releaseFunction, CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync(releaseFunction, cancellationToken);
        }

        public Task<TransactionReceipt> ReleaseRequestAndWaitForReceiptAsync(CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync<ReleaseFunction>(null, cancellationToken);
        }

        public Task<string> OwnerQueryAsync(OwnerFunction ownerFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<OwnerFunction, string>(ownerFunction, blockParameter);
        }

        
        public Task<string> OwnerQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<OwnerFunction, string>(null, blockParameter);
        }

        public Task<bool> IsOwnerQueryAsync(IsOwnerFunction isOwnerFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<IsOwnerFunction, bool>(isOwnerFunction, blockParameter);
        }

        
        public Task<bool> IsOwnerQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<IsOwnerFunction, bool>(null, blockParameter);
        }

        public Task<BigInteger> GetTotalTokensSoldQueryAsync(GetTotalTokensSoldFunction getTotalTokensSoldFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<GetTotalTokensSoldFunction, BigInteger>(getTotalTokensSoldFunction, blockParameter);
        }

        
        public Task<BigInteger> GetTotalTokensSoldQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<GetTotalTokensSoldFunction, BigInteger>(null, blockParameter);
        }

        public Task<BigInteger> ReleasedQueryAsync(ReleasedFunction releasedFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<ReleasedFunction, BigInteger>(releasedFunction, blockParameter);
        }

        
        public Task<BigInteger> ReleasedQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<ReleasedFunction, BigInteger>(null, blockParameter);
        }

        public Task<BigInteger> StartQueryAsync(StartFunction startFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<StartFunction, BigInteger>(startFunction, blockParameter);
        }

        
        public Task<BigInteger> StartQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<StartFunction, BigInteger>(null, blockParameter);
        }

        public Task<BigInteger> EndDateQueryAsync(EndDateFunction endDateFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<EndDateFunction, BigInteger>(endDateFunction, blockParameter);
        }

        
        public Task<BigInteger> EndDateQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<EndDateFunction, BigInteger>(null, blockParameter);
        }

        public Task<string> BuyCulteWithBnbRequestAsync(BuyCulteWithBnbFunction buyCulteWithBnbFunction)
        {
             return ContractHandler.SendRequestAsync(buyCulteWithBnbFunction);
        }

        public Task<TransactionReceipt> BuyCulteWithBnbRequestAndWaitForReceiptAsync(BuyCulteWithBnbFunction buyCulteWithBnbFunction, CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync(buyCulteWithBnbFunction, cancellationToken);
        }

        public Task<string> BuyCulteWithBnbRequestAsync(string to)
        {
            var buyCulteWithBnbFunction = new BuyCulteWithBnbFunction();
                buyCulteWithBnbFunction.To = to;
            
             return ContractHandler.SendRequestAsync(buyCulteWithBnbFunction);
        }

        public Task<TransactionReceipt> BuyCulteWithBnbRequestAndWaitForReceiptAsync(string to, CancellationTokenSource cancellationToken = null)
        {
            var buyCulteWithBnbFunction = new BuyCulteWithBnbFunction();
                buyCulteWithBnbFunction.To = to;
            
             return ContractHandler.SendRequestAndWaitForReceiptAsync(buyCulteWithBnbFunction, cancellationToken);
        }

        public Task<BigInteger> ApplyBonusQueryAsync(ApplyBonusFunction applyBonusFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<ApplyBonusFunction, BigInteger>(applyBonusFunction, blockParameter);
        }

        
        public Task<BigInteger> ApplyBonusQueryAsync(BigInteger cltAmount, BlockParameter blockParameter = null)
        {
            var applyBonusFunction = new ApplyBonusFunction();
                applyBonusFunction.CltAmount = cltAmount;
            
            return ContractHandler.QueryAsync<ApplyBonusFunction, BigInteger>(applyBonusFunction, blockParameter);
        }

        public Task<string> TransferOwnershipRequestAsync(TransferOwnershipFunction transferOwnershipFunction)
        {
             return ContractHandler.SendRequestAsync(transferOwnershipFunction);
        }

        public Task<TransactionReceipt> TransferOwnershipRequestAndWaitForReceiptAsync(TransferOwnershipFunction transferOwnershipFunction, CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync(transferOwnershipFunction, cancellationToken);
        }

        public Task<string> TransferOwnershipRequestAsync(string newOwner)
        {
            var transferOwnershipFunction = new TransferOwnershipFunction();
                transferOwnershipFunction.NewOwner = newOwner;
            
             return ContractHandler.SendRequestAsync(transferOwnershipFunction);
        }

        public Task<TransactionReceipt> TransferOwnershipRequestAndWaitForReceiptAsync(string newOwner, CancellationTokenSource cancellationToken = null)
        {
            var transferOwnershipFunction = new TransferOwnershipFunction();
                transferOwnershipFunction.NewOwner = newOwner;
            
             return ContractHandler.SendRequestAndWaitForReceiptAsync(transferOwnershipFunction, cancellationToken);
        }

        public Task<string> TokenQueryAsync(TokenFunction tokenFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<TokenFunction, string>(tokenFunction, blockParameter);
        }

        
        public Task<string> TokenQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<TokenFunction, string>(null, blockParameter);
        }
    }
}
