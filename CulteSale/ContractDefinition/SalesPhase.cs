using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Numerics;
using Nethereum.Hex.HexTypes;
using Nethereum.ABI.FunctionEncoding.Attributes;

namespace Cultesale.Contracts.CulteSale.ContractDefinition
{
    public partial class SalesPhase : SalesPhaseBase { }

    public class SalesPhaseBase 
    {
        [Parameter("uint256", "start", 1)]
        public virtual BigInteger Start { get; set; }
        [Parameter("uint256", "end", 2)]
        public virtual BigInteger End { get; set; }
        [Parameter("uint256", "timesPrice", 3)]
        public virtual BigInteger TimesPrice { get; set; }
        [Parameter("uint256", "saleSupply", 4)]
        public virtual BigInteger SaleSupply { get; set; }
        [Parameter("uint256", "amountSold", 5)]
        public virtual BigInteger AmountSold { get; set; }
    }
}
