// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {EthBettingDapp} from "../src/wager.sol";



contract DeployerScript is Script {
    function setUp() public {}

   function run() public returns (EthBettingDapp)  {
        vm.startBroadcast();
        EthBettingDapp app = new EthBettingDapp();

        vm.stopBroadcast();

         return app;

    }
}

// To deploy, run
// source .env
// forge script script/Deployer.s.sol --rpc-url $RPC_URL --broadcast --legacy --private-key $PRIVATE_KEY