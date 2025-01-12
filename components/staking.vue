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
    </div>

    <div
      class="box"
      :class="{ 'is-loading': loading, 'is-not-loaded': !loaded }"
    >
      <div class="level">
        <div class="level-left">
          <h2 class="subtitle has-text-dark">
            Stake JDFI
          </h2>
        </div>

        <div class="level-right">
          <div class="level-item">
            <a
              :href="`https://etherscan.io/address/${ jdfiStakingPoolAddress }`"
              target="_blank"
              rel="noopener noreferrer"
              class="has-text-dark"
            >
              <open-in-new-icon title="Open on Etherscan" />
            </a>
          </div>
        </div>
      </div>

      <p>Stake JDFI to earn weekly rewards.</p>

      <br>

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
                <td>{{ formatBalance(rewardsWeeklyJDFI) }}</td>
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
                <format-vertical-align-top-icon
                  title="Input maximum available"
                />
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
                :disabled="!$store.getters.connected || balanceJDFISUnlocked.isZero()"
                @click="setMaxUnstakeJDFIS()"
              >
                <format-vertical-align-top-icon
                  title="Input maximum available"
                />
              </button>
            </p>
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="!$store.getters.connected || balanceJDFISUnlocked.isZero()"
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

    <div
      class="box"
      :class="{ 'is-loading': loading, 'is-not-loaded': !loaded }"
    >
      <div class="level">
        <div class="level-left">
          <h2 class="subtitle has-text-dark">
            Stake UNI-V2
          </h2>
        </div>

        <div class="level-right">
          <div class="level-item">
            <a
              :href="`https://etherscan.io/address/${ univ2StakingPoolAddress }`"
              target="_blank"
              rel="noopener noreferrer"
              class="has-text-dark"
            >
              <open-in-new-icon title="Open on Etherscan" />
            </a>
          </div>
        </div>
      </div>

      <p>
        Add JDFI/ETH liquidity on <a href="https://app.uniswap.org/#/add/0x75cdc4f6be18dc003dc2ae424f85d1243f0fb781/ETH" target="_blank"
                                     rel="noopener noreferrer"
        >Uniswap</a>, then stake the received UNI-V2 tokens.
      </p>

      <br>

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
                <td>UNI-V2 Balance</td>
                <td>{{ formatBalance(balanceUNIV2) }}</td>
              </tr>
              <tr>
                <td>Staked UNI-V2 Balance</td>
                <td>{{ formatBalance(balanceUNIV2S) }}</td>
              </tr>
              <tr>
                <td>Unclaimed Rewards</td>
                <td>{{ formatBalance(rewardsUNIV2) }}</td>
              </tr>
              <tr>
                <td>Weekly Rewards Pending</td>
                <td>{{ formatBalance(rewardsWeeklyUNIV2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="column">
          <div class="field has-addons">
            <p class="control">
              <input
                v-model="inputStakeUNIV2"
                class="input"
                type="text"
                placeholder="UNI-V2 Amount"
              >
            </p>
            <p class="control">
              <button
                type="button"
                class="button is-info"
                :disabled="!$store.getters.connected || balanceUNIV2.isZero()"
                @click="setMaxStakeUNIV2()"
              >
                <format-vertical-align-top-icon
                  title="Input maximum available"
                />
              </button>
            </p>
            <p class="control is-expanded">
              <button
                v-show="approvedUNIV2.gte(balanceUNIV2)"
                type="button"
                class="button is-fullwidth is-info"
                :disabled="!$store.getters.connected || balanceUNIV2.isZero()"
                @click="stakeUNIV2()"
              >
                Stake UNI-V2
              </button>
              <button
                v-show="approvedUNIV2.lt(balanceUNIV2)"
                type="button"
                class="button is-fullwidth is-info"
                :disabled="!$store.getters.connected || balanceUNIV2.isZero()"
                @click="approveUNIV2()"
              >
                Approve UNI-V2
              </button>
            </p>
          </div>

          <div class="field has-addons">
            <p class="control">
              <input
                v-model="inputUnstakeUNIV2S"
                class="input"
                type="number"
                placeholder="JDFI-WETH-UNI-V2/S Amount"
              >
            </p>
            <p class="control">
              <button
                type="button"
                class="button is-info"
                :disabled="!$store.getters.connected || balanceUNIV2S.isZero()"
                @click="setMaxUnstakeUNIV2()"
              >
                <format-vertical-align-top-icon
                  title="Input maximum available"
                />
              </button>
            </p>
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="!$store.getters.connected || balanceUNIV2S.isZero()"
                @click="unstakeUNIV2S()"
              >
                Unstake UNI-V2
              </button>
            </p>
          </div>

          <div class="field is-grouped">
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="rewardsUNIV2.isZero()"
                @click="withdrawUNIV2S()"
              >
                Withdraw
              </button>
            </p>
            <!-- <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="rewardsJDFI.isZero()"
                @click="compoundJDFIS()"
              >
                Compound
              </button>
            </p> -->
          </div>
        </div>
      </div>
    </div>

    <div
      class="box"
      :class="{ 'is-loading': loading, 'is-not-loaded': !loaded }"
    >
      <div class="level">
        <div class="level-left">
          <h2 class="subtitle has-text-dark">
            Governance
          </h2>
        </div>

        <div class="level-right">
          <div class="level-item">
            <a
              :href="`https://etherscan.io/address/${ feePoolAddress }`"
              target="_blank"
              rel="noopener noreferrer"
              class="has-text-dark"
            >
              <open-in-new-icon title="Open on Etherscan" />
            </a>
          </div>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <table class="table">
            <tbody>
              <tr>
                <td>Next Rewards Distribution</td>
                <td>{{ timeLeftRebase }}</td>
              </tr>
              <tr>
                <td>Next Buyback</td>
                <td>{{ timeLeftBuyback }}</td>
              </tr>
              <tr>
                <td>Current Unstaking Fee</td>
                <td>{{ formatBP(feeCurrent) }}</td>
              </tr>
              <tr>
                <td>Next Unstaking Fee</td>
                <td>{{ formatBP(feeNext) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="column">
          <div class="field is-grouped">
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="rewardsUNIV2.isZero()"
                @click="rebase()"
              >
                Distribute Rewards
              </button>
            </p>
          </div>

          <div class="field is-grouped">
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="rewardsUNIV2.isZero()"
                @click="buyback()"
              >
                Execute Buyback
              </button>
            </p>
          </div>

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
      </div>
    </div>

    <div
      class="box"
      :class="{ 'is-loading': loading, 'is-not-loaded': !loaded }"
    >
      <div class="level">
        <div class="level-left">
          <h2 class="subtitle has-text-dark">
            Convert JDFI/A to locked JDFI/S
          </h2>
        </div>

        <div class="level-right">
          <div class="level-item">
            <a
              :href="`https://etherscan.io/address/${ airdropTokenAddress }`"
              target="_blank"
              rel="noopener noreferrer"
              class="has-text-dark"
            >
              <open-in-new-icon title="Open on Etherscan" />
            </a>
          </div>
        </div>
      </div>

      <p>Airdrop recipients must convert JDFI/A to JDFI/S in order to begin earning rewards.  This JDFI/S cannot be unstaked unless unlocked with a fee of 0.25 ETH per token.</p>

      <br>

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
                <format-vertical-align-top-icon
                  title="Input maximum available"
                />
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
import { ethers, BigNumber } from 'ethers';

import FormatVerticalAlignTopIcon from 'vue-material-design-icons/FormatVerticalAlignTop.vue';
import OpenInNewIcon from 'vue-material-design-icons/OpenInNew.vue';

import JusDeFi from 'jusdefi-contracts/abi/JusDeFi.json';
import FeePool from 'jusdefi-contracts/abi/FeePool.json';
import JDFIStakingPool from 'jusdefi-contracts/abi/JDFIStakingPool.json';
import UNIV2StakingPool from 'jusdefi-contracts/abi/UNIV2StakingPool.json';
import AirdropToken from 'jusdefi-contracts/abi/AirdropToken.json';
import IUniswapV2Pair from 'jusdefi-contracts/abi/IUniswapV2Pair.json';
import IERC20 from 'jusdefi-contracts/abi/IERC20.json';

import deployments from 'jusdefi-contracts/data/deployments.json';

export default {
  components: { FormatVerticalAlignTopIcon, OpenInNewIcon },

  data: function () {
    return {
      airdropTokenAddress: deployments.airdropToken,
      feePoolAddress: deployments.feePool,
      jdfiStakingPoolAddress: deployments.jdfiStakingPool,
      jusdefiAddress: deployments.jusdefi,
      uniswapPairAddress: deployments.uniswapPair,
      univ2StakingPoolAddress: deployments.univ2StakingPool,
      wethAddress: deployments.weth,

      feePool: null,
      jdfiStakingPool: null,
      jusdefi: null,
      uniswapPair: null,
      univ2StakingPool: null,
      weth: null,

      loading: false,
      loaded: false,
      error: null,

      balanceETH: BigNumber.from(0),
      balanceJDFI: BigNumber.from(0),
      balanceJDFIS: BigNumber.from(0), // locked + unlocked
      balanceJDFISUnlocked: BigNumber.from(0),
      balanceJDFISLocked: BigNumber.from(0),
      balanceJDFIA: BigNumber.from(0),
      balanceUNIV2: BigNumber.from(0),
      balanceUNIV2S: BigNumber.from(0),

      rewardsJDFI: BigNumber.from(0),
      rewardsUNIV2: BigNumber.from(0),

      inputVoteIncrease: '',
      inputVoteDecrease: '',

      inputStakeJDFI: '',
      inputUnstakeJDFIS: '',
      inputStakeUNIV2: '',
      inputUnstakeUNIV2S: '',
      inputUnlockJDFIS: '',

      balanceFeePoolJDFI: BigNumber.from(0),
      balanceJDFIStakingPoolJDFI: BigNumber.from(1),

      balanceOfUniswapPairJDFI: BigNumber.from(0),
      totalSupplyUNIV2: BigNumber.from(1),
      stakedUNIV2: BigNumber.from(0),

      approvedUNIV2: BigNumber.from(0),

      deadlineRebase: Math.floor(this.getNextDate(0).getTime() / 1000),
      timeLeftRebase: this.formatTimeRemaining(new Date()),

      deadlineBuyback: Math.floor(this.getNextDate(5).getTime() / 1000),
      timeLeftBuyback: this.formatTimeRemaining(new Date()),

      votesIncrease: BigNumber.from(0),
      votesDecrease: BigNumber.from(0),

      feeCurrent: BigNumber.from(1000),
    };
  },

  computed: {
    totalRewardShares: function () {
      let shares = this.balanceJDFIStakingPoolJDFI.add(
        this.balanceUNIV2StakingPoolJDFI.mul(BigNumber.from(3))
      );

      return shares.isZero() ? BigNumber.from(1) : shares;
    },

    rewardsWeeklyJDFI: function () {
      let shares = this.balanceJDFISUnlocked.add(this.balanceJDFISLocked);
      return shares.mul(this.balanceFeePoolJDFI).div(this.totalRewardShares);
    },

    rewardsWeeklyUNIV2: function () {
      let shares = this.balanceUNIV2S.mul(BigNumber.from(3)).mul(this.balanceOfUniswapPairJDFI).div(this.totalSupplyUNIV2);
      return shares.mul(this.balanceFeePoolJDFI).div(this.totalRewardShares);
    },

    balanceUNIV2StakingPoolJDFI: function () {
      return this.balanceOfUniswapPairJDFI.mul(this.stakedUNIV2).div(this.totalSupplyUNIV2);
    },

    apyJDFI: function () {
      let denominator = this.balanceJDFIStakingPoolJDFI.add(this.balanceUNIV2StakingPoolJDFI.mul(BigNumber.from(3)));
      let rewards = this.balanceFeePoolJDFI.mul(this.balanceJDFIStakingPoolJDFI).div(denominator);

      return BigNumber.from(100).mul(rewards).mul(BigNumber.from(52)).div(
        this.balanceJDFIStakingPoolJDFI
      );
    },

    apyUNIV2: function () {
      let denominator = this.balanceJDFIStakingPoolJDFI.add(this.balanceUNIV2StakingPoolJDFI.mul(BigNumber.from(3)));
      let rewards = this.balanceFeePoolJDFI.mul(this.balanceUNIV2StakingPoolJDFI).mul(BigNumber.from(3)).div(BigNumber.from(2)).div(denominator);

      return BigNumber.from(100).mul(rewards).mul(BigNumber.from(52)).div(
        this.balanceUNIV2StakingPoolJDFI.add(BigNumber.from(1))
      );
    },

    feeNext: function () {
      let net = this.votesIncrease.sub(this.votesDecrease).abs();
      let base = BigNumber.from(1000);
      let delta = BigNumber.from(1000).mul(net).div(
        ethers.utils.parseEther('3').add(net)
      );

      return base[
        this.votesIncrease.gt(this.votesDecrease) ? 'add' : 'sub'
      ](delta);
    },
  },

  watch: {
    '$store.getters.currentNetwork': function () {
      this.getContracts();
    },

    '$store.getters.currentAccount': function (curr) {
      if (curr) {
        this.getBalances();
      } else {
        this.loaded = false;
      }
    },

    feePool: async function () {
      this.votesIncrease = await this.feePool.callStatic._votesIncrease();
      this.votesDecrease = await this.feePool.callStatic._votesDecrease();
      this.feeCurrent = await this.feePool.callStatic._fee();
    },

    jusdefi: async function () {
      this.balanceFeePoolJDFI = await this.jusdefi.callStatic.balanceOf(this.feePoolAddress);
      this.balanceJDFIStakingPoolJDFI = await this.jusdefi.callStatic.balanceOf(this.jdfiStakingPoolAddress);
      this.balanceOfUniswapPairJDFI = await this.jusdefi.callStatic.balanceOf(this.uniswapPairAddress);
    },

    uniswapPair: async function () {
      this.totalSupplyUNIV2 = await this.uniswapPair.callStatic.totalSupply();
      this.stakedUNIV2 = await this.uniswapPair.callStatic.balanceOf(this.univ2StakingPoolAddress);
      this.approvedUNIV2 = await this.uniswapPair.callStatic.allowance(this.$store.getters.currentAccount, this.univ2StakingPoolAddress);
    },
  },

  mounted: function () {
    setInterval(function () {
      this.timeLeftBuyback = this.formatTimeRemaining(this.deadlineBuyback);
      this.timeLeftRebase = this.formatTimeRemaining(this.deadlineRebase);
    }.bind(this), 1000);
  },

  methods: {
    getContracts: async function () {
      this.loading = true;

      try {
        let signer = this.$store.getters.provider.getSigner();
        this.jusdefi = new ethers.Contract(this.jusdefiAddress, JusDeFi, signer);
        this.feePool = new ethers.Contract(this.feePoolAddress, FeePool, signer);
        this.jdfiStakingPool = new ethers.Contract(this.jdfiStakingPoolAddress, JDFIStakingPool, signer);
        this.univ2StakingPool = new ethers.Contract(this.univ2StakingPoolAddress, UNIV2StakingPool, signer);
        this.airdropToken = new ethers.Contract(this.airdropTokenAddress, AirdropToken, signer);
        this.uniswapPair = new ethers.Contract(this.uniswapPairAddress, IUniswapV2Pair, signer);
        this.weth = new ethers.Contract(this.wethAddress, IERC20, signer);
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
        this.balanceJDFIS = await this.jdfiStakingPool.callStatic.balanceOf(currentAccount);
        this.balanceJDFISLocked = await this.jdfiStakingPool.callStatic.lockedBalanceOf(currentAccount);
        this.balanceJDFISUnlocked = this.balanceJDFIS.sub(this.balanceJDFISLocked);
        this.rewardsJDFI = await this.jdfiStakingPool.callStatic.rewardsOf(currentAccount);
      }

      if (this.uniswapPair) {
        this.balanceUNIV2 = await this.uniswapPair.callStatic.balanceOf(currentAccount);
      }

      if (this.univ2StakingPool) {
        this.balanceUNIV2S = await this.univ2StakingPool.callStatic.balanceOf(currentAccount);
        this.rewardsUNIV2 = await this.univ2StakingPool.callStatic.rewardsOf(currentAccount);
      }

      if (this.airdropToken) {
        this.balanceJDFIA = await this.airdropToken.callStatic.balanceOf(currentAccount);
      }

      this.loading = false;
      this.loaded = true;
    },

    voteIncrease: async function () {
      this.loading = true;

      try {
        let tx = await this.feePool.vote(true, {
          value: ethers.utils.parseEther(this.inputVoteIncrease),
        });
        await tx.wait();
      } catch (e) {
        this.error = e.data && e.data.message;
      }

      this.loading = false;

      await this.getBalances();
    },

    voteDecrease: async function () {
      this.loading = true;

      try {
        let tx = await this.feePool.vote(false, {
          value: ethers.utils.parseEther(this.inputVoteDecrease),
        });
        await tx.wait();
      } catch (e) {
        this.error = e.data && e.data.message;
      }

      this.loading = false;

      await this.getBalances();
    },

    stakeJDFI: async function () {
      this.loading = true;

      try {
        let tx = await this.jdfiStakingPool.stake(ethers.utils.parseEther(this.inputStakeJDFI));
        await tx.wait();
      } catch (e) {
        this.error = e.data && e.data.message;
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
        this.error = e.data && e.data.message;
      }

      this.loading = false;

      await this.getBalances();
    },

    unstakeUNIV2S: async function () {
      this.loading = true;

      try {
        let amount = ethers.utils.parseEther(this.inputUnstakeUNIV2S);
        let total = await this.uniswapPair.callStatic.totalSupply();

        let liquidityJDFI = await this.jusdefi.callStatic.balanceOf(this.uniswapPairAddress);
        let liquidityWETH = await this.weth.callStatic.balanceOf(this.uniswapPairAddress);

        let tx = await this.univ2StakingPool.unstake(
          amount,
          liquidityJDFI.mul(amount).div(total).mul(BigNumber.from(99)).div(BigNumber.from(100)),
          liquidityWETH.mul(amount).div(total).mul(BigNumber.from(99)).div(BigNumber.from(100))
        );
        await tx.wait();
      } catch (e) {
        this.error = e.data && e.data.message;
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
        this.error = e.data && e.data.message;
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
        this.error = e.data && e.data.message;
      }

      this.loading = false;

      await this.getBalances();
    },

    withdrawUNIV2S: async function () {
      this.loading = true;

      try {
        let tx = await this.univ2StakingPool.withdraw();
        await tx.wait();
      } catch (e) {
        this.error = e.data && e.data.message;
      }

      this.loading = false;

      await this.getBalances();
    },

    approveUNIV2: async function () {
      this.loading = true;

      try {
        let tx = await this.uniswapPair.approve(this.univ2StakingPoolAddress, ethers.constants.MaxUint256);
        await tx.wait();
      } catch (e) {
        this.error = e.data && e.data.message;
      }

      this.loading = false;
    },

    stakeUNIV2: async function () {
      this.loading = true;

      try {
        let tx = await this.univ2StakingPool['stake(uint256)'](ethers.utils.parseEther(this.inputStakeUNIV2));
        await tx.wait();
      } catch (e) {
        this.error = e.data && e.data.message;
      }

      this.loading = false;
    },

    convertJDFIA: async function () {
      this.loading = true;

      try {
        let tx = await this.airdropToken.exchange();
        await tx.wait();
      } catch (e) {
        this.error = e.data && e.data.message;
      }

      this.loading = false;

      await this.getBalances();
    },

    unlockJDFIS: async function () {
      this.loading = true;

      try {
        let tx = await this.jdfiStakingPool.unlock({
          value: ethers.utils.parseEther(this.inputUnlockJDFIS).div(BigNumber.from(4)),
        });
        await tx.wait();
      } catch (e) {
        this.error = e.data && e.data.message;
      }

      this.loading = false;

      await this.getBalances();
    },

    setMaxStakeJDFI: function () {
      this.inputStakeJDFI = ethers.utils.formatEther(this.balanceJDFI);
    },

    setMaxUnstakeJDFIS: function () {
      this.inputUnstakeJDFIS = ethers.utils.formatEther(this.balanceJDFISUnlocked);
    },

    setMaxStakeUNIV2: function () {
      this.inputStakeUNIV2 = ethers.utils.formatEther(this.balanceUNIV2);
    },

    setMaxUnstakeUNIV2: function () {
      this.inputUnstakeUNIV2S = ethers.utils.formatEther(this.balanceUNIV2S);
    },

    setMaxUnlockJDFIS: function () {
      this.inputUnlockJDFIS = ethers.utils.formatEther(this.balanceJDFISLocked);
    },

    formatBP: function (bn) {
      return `${ (bn.toNumber() / 100).toFixed(2) }%`;
    },

    formatBalance: function (bn, decimals = 2) {
      return (Number((bn || BigNumber.from(0)).toString()) / 1e18).toFixed(decimals);
    },

    formatTimeRemaining: function (target) {
      let remaining = target - Math.floor(new Date().getTime() / 1000);

      let seconds = Math.floor(remaining % 60);
      let minutes = Math.floor(remaining / 60 % 60);
      let hours   = Math.floor(remaining / (60 * 60) % 24);
      let days    = Math.floor(remaining / (60 * 60 * 24));

      return [days, hours, minutes, seconds].map(n => `${ n }`.padStart(2, '0')).join(':');
    },

    getNextDate: function (day) {
      let now = new Date();
      return new Date(
        now.getTime() - (now.getTime() % 86400000) + ((7 + day - now.getUTCDay()) % 7 || 7) * 86400000
      );
    },
  },
};
</script>
