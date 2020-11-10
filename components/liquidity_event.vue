<template>
  <div class="container">
    <div class="box">
      <div class="level">
        <div class="level-left">
          <h1 class="title has-text-dark">
            JusDeFi Liquidity Event
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

      <p>Welcome to the JusDeFi Liquidity Event. See our <a href="https://www.jusde.fi/">home page</a> for more information.</p>

      <p>The JusDeFi Liquidity Event interface works best with a Metamask-enabled desktop browser.</p>

      <br>

      <h2 class="subtitle has-text-dark">
        JDFI Claimed: <span v-if="$store.getters.connected">{{ formatBalance(claimedJDFIS, 0) }} / {{ formatBalance(totalJDFIS, 0) }}</span>
      </h2>
      <progress
        v-if="!claimedJDFIS"
        class="progress is-info"
      />
      <progress
        v-else
        class="progress is-info"
        :max="totalJDFIS"
        :value="claimedJDFIS"
      />
    </div>

    <div class="box">
      <div class="level">
        <div class="level-left">
          <h2 class="subtitle has-text-dark">
            Purchase
          </h2>
        </div>
      </div>

      <p>Deposit ETH to receive staked JDFI.  4 JDFI per ETH.</p>

      <br>

      <div class="columns">
        <div class="column">
          <table class="table">
            <tbody>
              <tr>
                <td>ETH Balance</td>
                <td>{{ formatBalance(balanceETH) }}</td>
              </tr>
              <tr>
                <td>JDFI/S Balance</td>
                <td>{{ formatBalance(balanceJDFIS) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="column">
          <div class="field has-addons">
            <p class="control">
              <input
                v-model="inputDeposit"
                class="input"
                type="number"
              >
            </p>
            <p class="control is-expanded">
              <button
                type="button"
                class="button is-fullwidth is-info"
                :disabled="!$store.getters.connected"
                @click="deposit()"
              >
                Deposit ETH
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
import JDFIStakingPool from 'jusdefi/abi/JDFIStakingPool.json';

import deployments from 'jusdefi/data/deployments.json';

export default {
  data: function () {
    return {
      jusdefiAddress: deployments.jusdefi,
      jdfiStakingPoolAddress: deployments.jdfiStakingPool,

      jusdefi: null,
      jdfiStakingPool: null,

      loading: false,
      error: null,

      balanceETH: new BN(0),
      balanceJDFIS: new BN(0),

      inputDeposit: 0,

      deadline: 1604951460,

      totalJDFIS: ethers.utils.parseEther('10000'),
      claimedJDFIS: null,
    };
  },

  watch: {
    '$store.getters.currentNetwork': function () {
      this.getContracts();
    },

    '$store.getters.currentAccount': function (curr) {
      if (curr) {
        this.getEthBalance();
      }
    },

    jdfiStakingPool: function () {
      this.getJDFISBalance();
    },
  },

  methods: {
    getContracts: async function () {
      this.loading = true;

      try {
        let signer = this.$store.getters.provider.getSigner();
        this.jusdefi = new ethers.Contract(this.jusdefiAddress, JusDeFi, signer);
        this.jdfiStakingPool = new ethers.Contract(this.jdfiStakingPoolAddress, JDFIStakingPool, signer);
      } catch (e) {
        this.error = e.message;
      }

      this.loading = false;
    },

    getEthBalance: async function () {
      this.loading = true;

      try {
        let { currentAccount } = this.$store.getters;
        this.balanceETH = await this.$store.getters.provider.getBalance(currentAccount);
      } catch (e) {
        // this.error = e.message;
      }

      this.loading = false;
    },

    getJDFISBalance: async function () {
      this.loading = true;

      try {
        let { currentAccount } = this.$store.getters;
        this.balanceJDFIS = await this.jdfiStakingPool.callStatic.balanceOf(currentAccount);
        let remaining = await this.jdfiStakingPool.callStatic.balanceOf(this.jusdefi.address);
        this.claimedJDFIS = this.totalJDFIS.sub(remaining);
      } catch (e) {
        // this.error = e.message;
      }

      this.loading = false;
    },

    deposit: async function () {
      this.loading = true;

      try {
        let tx = await this.jusdefi.liquidityEventDeposit({
          value: ethers.utils.parseEther(this.inputDeposit),
        });
        await tx.wait();
        await this.getEthBalance();
        await this.getJDFISBalance();
      } catch (e) {
        if (e.data) {
          this.error = e.data.message;
        }
      }

      this.loading = false;
    },

    formatBalance: function (bn, decimals = 2) {
      return (Number((bn || new BN(0)).toString()) / 1e18).toFixed(decimals);
    },
  },
};
</script>
