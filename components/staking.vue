<template>
  <div class="container">
    <div class="box">
      <div class="level">
        <div class="level-left">
          <h1 class="title has-text-dark">
            JusDeFi Staking Dashboard
          </h1>
        </div>

        <div class="level-right">
          <button
            type="button"
            class="button is-fullwidth is-info"
            :class="{ 'is-loading': $store.getters.connecting }"
            :disabled="$store.getters.connected"
            @click="$store.dispatch('connect')"
          >
            <span v-if="$store.getters.connected" class="is-family-monospace">{{ $store.getters.currentAccount }}</span>
            <span v-else>Connect to Metamask</span>
          </button>
        </div>
      </div>

      <article v-show="error" class="message">
        <div class="message-header">
          <p>Error</p>
          <button class="delete" aria-label="delete" @click="error = null" />
        </div>
        <div class="message-body">
          {{ error }}
        </div>
      </article>

      <p>Welcome to the JusDeFi Staking Dashboard.  Earn rewards on staked JDFI or Uniswap liquidity tokens, and vote on protocol adjustments.  See our staking guide for more information.</p>

      <p>JDFI is available on <a href="https://app.uniswap.org/#/swap?outputCurrency=0x75cdc4f6be18dc003dc2ae424f85d1243f0fb781">Uniswap</a>.</p>

      <!-- <br>

      <div class="columns">
        <div class="column">
          <table class="table">
            <tbody>
              <tr>
                <td>Next Rewards Distribution</td>
                <td>{{ 'TODO' }}</td>
              </tr>
              <tr>
                <td>Next Buyback</td>
                <td>{{ 'TODO' }}</td>
              </tr>
              <tr>
                <td>Current Unstaking Fee</td>
                <td>{{ 'TODO' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="column">
          <div class="field has-addons">
            <p class="control">
              <input
                v-model="inputVoteIncrease"
                placeholder="ETH Amount"
                class="input"
                type="number"
              >
            </p>
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="!$store.getters.connected"
                @click="voteIncrease()"
              >
                Increase Next Fee
              </button>
            </p>
          </div>

          <div class="field has-addons">
            <p class="control">
              <input
                v-model="inputVoteDecrease"
                placeholder="ETH Amount"
                class="input"
                type="number"
              >
            </p>
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="!$store.getters.connected"
                @click="voteDecrease()"
              >
                Decrease Next Fee
              </button>
            </p>
          </div>
        </div>
      </div> -->
    </div>

    <div class="box">
      <div class="level">
        <div class="level-left">
          <h2 class="subtitle has-text-dark">
            Stake JDFI
          </h2>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <table class="table">
            <tbody>
              <tr>
                <td>JDFI Balance</td>
                <td>{{ formatBalance(balanceJDFI) }}</td>
              </tr>
              <tr>
                <td>Staked JDFI Balance</td>
                <td>{{ formatBalance(balanceJDFIS) }}</td>
              </tr>
              <tr>
                <td>Unclaimed Rewards</td>
                <td>{{ formatBalance(rewardsJDFI) }}</td>
              </tr>
              <tr>
                <td>Weekly Rewards Pending</td>
                <td>{{ formatBalance(rewardsEarnedJDFI) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="column">
          <div class="field has-addons">
            <p class="control">
              <input
                v-model="inputStakeJDFI"
                class="input"
                type="number"
                placeholder="JDFI Amount"
              >
            </p>
            <p class="control">
              <button
                type="button"
                class="button is-info"
                :disabled="!$store.getters.connected || balanceJDFI.isZero()"
                @click="setMaxStakeJDFI()"
              >
                max
              </button>
            </p>
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="!$store.getters.connected || balanceJDFI.isZero()"
                @click="stakeJDFI()"
              >
                Stake JDFI
              </button>
            </p>
          </div>

          <div class="field has-addons">
            <p class="control">
              <input
                v-model="inputUnstakeJDFIS"
                class="input"
                type="number"
                placeholder="JDFI/S Amount"
              >
            </p>
            <p class="control">
              <button
                type="button"
                class="button is-info"
                :disabled="!$store.getters.connected || balanceJDFIS.isZero()"
                @click="setMaxUnstakeJDFIS()"
              >
                max
              </button>
            </p>
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="!$store.getters.connected || balanceJDFIS.isZero()"
                @click="unstakeJDFIS()"
              >
                Unstake JDFI
              </button>
            </p>
          </div>

          <div class="field is-grouped">
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="rewardsJDFI.isZero()"
                @click="withdrawJDFIS()"
              >
                Withdraw
              </button>
            </p>
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="rewardsJDFI.isZero()"
                @click="compoundJDFIS()"
              >
                Compound
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="box">
      <div class="level">
        <div class="level-left">
          <h2 class="subtitle has-text-dark">
            Stake JDFI/WETH UNI-V2
          </h2>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <table class="table">
            <tbody>
              <!-- <tr>
                <td>ETH Balance</td>
                <td>{{ formatBalance(balanceETH) }}</td>
              </tr>
              <tr>
                <td>JDFI Balance</td>
                <td>{{ formatBalance(balanceJDFI) }}</td>
              </tr> -->
              <tr>
                <td>JDFI/WETH UNI-V2 Balance</td>
                <td>{{ formatBalance(balanceUNIV2) }}</td>
              </tr>
              <tr>
                <td>JDFI-WETH-UNI-V2/S Balance</td>
                <td>{{ formatBalance(balanceUNIV2S) }}</td>
              </tr>
              <tr>
                <td>Unclaimed Rewards</td>
                <td>{{ formatBalance(rewardsUNIV2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="column">
          <p>Coming Soon!</p>
        </div>
      </div>
    </div>

    <div class="box">
      <div class="level">
        <div class="level-left">
          <h2 class="subtitle has-text-dark">
            Convert JDFI/A to locked JDFI/S
          </h2>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <table class="table">
            <tbody>
              <tr>
                <td>JDFI/A Balance</td>
                <td>{{ formatBalance(balanceJDFIA) }}</td>
              </tr>
              <tr>
                <td>Locked Staked JDFI Balance</td>
                <td>{{ formatBalance(balanceJDFISLocked) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="column">
          <div class="field">
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="balanceJDFIA.isZero()"
                @click="convertJDFIA()"
              >
                Convert
              </button>
            </p>
          </div>

          <div class="field has-addons">
            <p class="control is-expanded">
              <input
                v-model="inputUnlockJDFIS"
                class="input"
                type="number"
                placeholder="JDFI/S Amount"
              >
            </p>
            <p class="control">
              <button
                type="button"
                class="button is-info"
                :disabled="!$store.getters.connected || balanceJDFISLocked.isZero()"
                @click="setMaxUnlockJDFIS()"
              >
                max
              </button>
            </p>
            <p class="control">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="!$store.getters.connected || balanceJDFISLocked.isZero()"
                @click="unlockJDFIS()"
              >
                Unlock JDFI/S
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import BN from 'bn.js';

import JusDeFi from 'jusdefi/abi/JusDeFi.json';
import FeePool from 'jusdefi/abi/FeePool.json';
import JDFIStakingPool from 'jusdefi/abi/JDFIStakingPool.json';
import UNIV2StakingPool from 'jusdefi/abi/UNIV2StakingPool.json';
import AirdropToken from 'jusdefi/abi/AirdropToken.json';

import deployments from 'jusdefi/data/deployments.json';

export default {
  data: function () {
    return {
      airdropTokenAddress: deployments.airdropToken,
      jusdefiAddress: deployments.jusdefi,
      jdfiStakingPoolAddress: deployments.jdfiStakingPool,
      feePoolAddress: deployments.feePool,

      jusdefi: null,
      feePool: null,
      jdfiStakingPool: null,
      univ2StakingPool: null,

      loading: false,
      error: null,

      balanceETH: new BN(0),
      balanceJDFI: new BN(0),
      balanceJDFIS: new BN(0),
      balanceJDFISLocked: new BN(0),
      balanceJDFIA: new BN(0),
      balanceUNIV2: new BN(0),
      balanceUNIV2S: new BN(0),

      rewardsJDFI: new BN(0),
      rewardsUNIV2: new BN(0),

      inputStakeJDFI: '',
      inputUnstakeJDFIS: '',
      inputUnlockJDFIS: '',

      totalRewardsJDFI: new BN(0),
      totalSupplyJDFIS: new BN(1),

      // deadlineRebase: 'TODO: Sunday',
      // timeLeftRebase: 'TODO',
      //
      // deadlineBuyback: 'TODO: Friday',
      // timeLeftBuyback: 'TODO',
    };
  },

  computed: {
    rewardsEarnedJDFI: function () {
      let balanceJDFIS = new BN(this.balanceJDFIS.toString());
      let balanceJDFISLocked = new BN(this.balanceJDFISLocked.toString());
      let totalRewardsJDFI = new BN(this.totalRewardsJDFI.toString());
      let totalSupplyJDFIS = new BN(this.totalSupplyJDFIS.toString());

      return totalRewardsJDFI.mul(
        balanceJDFIS.add(balanceJDFISLocked)
      ).div(
        totalSupplyJDFIS
      );
    },
  },

  watch: {
    '$store.getters.currentNetwork': function () {
      this.getContracts();
    },

    '$store.getters.currentAccount': function (curr) {
      if (curr) {
        this.getBalances();
      }
    },

    jdfiStakingPool: async function () {
      this.totalSupplyJDFIS = await this.jdfiStakingPool.callStatic.totalSupply();
    },

    jusdefi: async function () {
      this.totalRewardsJDFI = await this.jusdefi.callStatic.balanceOf(this.feePoolAddress);
    },
  },

  mounted: function () {
    setInterval(function () {
      // this.timeLeftBuyback = this.formatTimeRemaining(this.deadlineBuyback);
      // this.timeLeftRebase = this.formatTimeRemaining(this.deadlineRebase);
    }.bind(this), 1000);
  },

  methods: {
    getContracts: async function () {
      this.loading = true;

      try {
        let signer = this.$store.getters.provider.getSigner();
        this.jusdefi = new ethers.Contract(this.jusdefiAddress, JusDeFi, signer);
        // this.feePool = new ethers.Contract(this.feePoolAddress, FeePool, signer);
        this.jdfiStakingPool = new ethers.Contract(this.jdfiStakingPoolAddress, JDFIStakingPool, signer);
        // this.univ2StakingPool = new ethers.Contract(this.univ2StakingPoolAddress, UNIV2StakingPool, signer);
        this.airdropToken = new ethers.Contract(this.airdropTokenAddress, AirdropToken, signer);
      } catch (e) {
        this.error = e.message;
      }

      this.loading = false;

      await this.getBalances();
    },

    getBalances: async function () {
      this.loading = true;

      let { currentAccount } = this.$store.getters;

      this.balanceETH = await this.$store.getters.provider.getBalance(currentAccount);

      if (this.jusdefi) {
        this.balanceJDFI = await this.jusdefi.callStatic.balanceOf(currentAccount);
      }

      if (this.jdfiStakingPool) {
        let totalBalance = await this.jdfiStakingPool.callStatic.balanceOf(currentAccount);
        this.balanceJDFISLocked = await this.jdfiStakingPool.callStatic.lockedBalanceOf(currentAccount);
        this.balanceJDFIS = totalBalance.sub(this.balanceJDFISLocked);
      }

      if (this.airdropToken) {
        this.balanceJDFIA = await this.airdropToken.callStatic.balanceOf(currentAccount);
      }

      this.loading = false;
    },

    stakeJDFI: async function () {
      this.loading = true;

      try {
        let tx = await this.jdfiStakingPool.stake(ethers.utils.parseEther(this.inputStakeJDFI));
        await tx.wait();
      } catch (e) {
        if (e.data) {
          this.error = e.data.message;
        }
      }

      this.loading = false;

      await this.getBalances();
    },

    unstakeJDFIS: async function () {
      this.loading = true;

      try {
        let tx = await this.jdfiStakingPool.unstake(ethers.utils.parseEther(this.inputUnstakeJDFIS));
        await tx.wait();
      } catch (e) {

        if (e.data) {
          this.error = e.data.message;
        }
      }

      this.loading = false;

      await this.getBalances();
    },

    compoundJDFIS: async function () {
      this.loading = true;

      try {
        let tx = await this.jdfiStakingPool.compound();
        await tx.wait();
      } catch (e) {
        if (e.data) {
          this.error = e.data.message;
        }
      }

      this.loading = false;

      await this.getBalances();
    },

    withdrawJDFIS: async function () {
      this.loading = true;

      try {
        let tx = await this.jdfiStakingPool.withdraw();
        await tx.wait();
      } catch (e) {
        if (e.data) {
          this.error = e.data.message;
        }
      }

      this.loading = false;

      await this.getBalances();
    },

    convertJDFIA: async function () {
      this.loading = true;

      try {
        let tx = await this.airdropToken.exchange();
        await tx.wait();
      } catch (e) {
        if (e.data) {
          this.error = e.data.message;
        }
      }

      this.loading = false;

      await this.getBalances();
    },

    unlockJDFIS: async function () {
      this.loading = true;

      try {
        let value = new BN(ethers.utils.parseEther(this.inputUnlockJDFIS).toString()).div(new BN(4));
        let tx = await this.jdfiStakingPool.unlock({
          value: value.toString(),
        });
        await tx.wait();
      } catch (e) {
        if (e.data) {
          this.error = e.data.message;
        }
      }

      this.loading = false;

      await this.getBalances();
    },

    setMaxStakeJDFI: function () {
      this.inputStakeJDFI = ethers.utils.formatEther(this.balanceJDFI);
    },

    setMaxUnstakeJDFIS: function () {
      this.inputUnstakeJDFIS = ethers.utils.formatEther(this.balanceJDFIS);
    },

    setMaxUnlockJDFIS: function () {
      this.inputUnlockJDFIS = ethers.utils.formatEther(this.balanceJDFISLocked);
    },

    formatBalance: function (bn, decimals = 2) {
      return (Number((bn || new BN(0)).toString()) / 1e18).toFixed(decimals);
    },

    formatTimeRemaining: function (target) {
      let remaining = target - Math.floor(new Date().getTime() / 1000);

      let seconds = Math.floor(remaining % 60);
      let minutes = Math.floor(remaining / 60 % 60);
      let hours   = Math.floor(remaining / (60 * 60) % 24);
      let days    = Math.floor(remaining / (60 * 60 * 24));

      return [days, hours, minutes, seconds].map(n => `${ n }`.padStart(2, '0')).join(':');
    },
  },
};
</script>
