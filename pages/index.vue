<template>
  <div class="hero is-fullheight is-primary">
    <div class="hero-body">
      <div class="container">
        <div class="box">
          <div class="level">
            <div class="level-left">
              <h1 class="title has-text-dark">JusDeFi Liquidity Event</h1>
            </div>

            <div class="level-right">
              <button
                type="button"
                class="button is-fullwidth is-info"
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

          <div class="columns">
            <div class="column">
              <h2 class="subtitle has-text-dark">JDFI Claimed</h2>
              <progress
                class="progress is-info"
                max="100"
              >
                TODO
              </progress>
            </div>

            <div class="column">
              <h2 class="subtitle has-text-dark">Time Remaining</h2>
              <p>TODO</p>
            </div>
          </div>
        </div>

        <div class="box">
          <div class="level">
            <div class="level-left">
              <h2 class="subtitle has-text-dark">Purchase</h2>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <div class="table">
                <tbody>
                  <tr>
                    <td>ETH Balance</td>
                    <td>{{ format(balanceETH) }}</td>
                  </tr>
                  <tr>
                    <td>JDFI/S Balance</td>
                    <td>{{ format(balanceJDFIS) }}</td>
                  </tr>
                </tbody>
              </div>
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
                    Deposit
                  </button>
                </p>
              </div>
            </div>
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

export default {
  data: function () {
    return {
      instanceAddress: '0x5fbdb2315678afecb367f032d93f642f64180aa3',

      instance: null,
      jdfiStakingPool: null,

      loading: false,
      error: null,

      balanceETH: new BN(0),
      balanceJDFIS: new BN(0),

      liquidityEventClosedAt: new BN(0),

      inputDeposit: 0,
    }
  },

  watch: {
    '$store.getters.currentNetwork': function () {
      this.getInstance();
    },

    '$store.getters.currentAccount': function (curr) {
      if (curr) {
        this.getEthBalance();
      }
    },

    instance: function () {
      this.getStatus();
    },

    jdfiStakingPool: function () {
      this.getJDFISBalance();
    }
  },

  methods: {
    getInstance: async function () {
      this.loading = true;

      try {
        let signer = this.$store.getters.provider.getSigner()
        this.instance = new ethers.Contract(this.instanceAddress, JusDeFi, signer);
        let jdfiStakingPoolAddress = await this.instance.callStatic._jdfiStakingPool();
        this.jdfiStakingPool = new ethers.Contract(jdfiStakingPoolAddress, JDFIStakingPool, signer);
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
        this.error = e.message;
      }

      this.loading = false;
    },

    getJDFISBalance: async function () {
      this.loading = true;

      try {
        let { currentAccount } = this.$store.getters;
        this.balanceJDFIS = await this.jdfiStakingPool.callStatic.balanceOf(currentAccount);
      } catch (e) {
        this.error = e.message;
      }

      this.loading = false;
    },

    getStatus: async function () {
      this.loading = true;

      try {
        this.liquidityEventClosedAt = await this.instance.callStatic._liquidityEventClosedAt();
      } catch (e) {
        this.error = e.message;
      }

      this.loading = false;
    },

    deposit: async function () {
      this.loading = true;

      try {
        let tx = await this.instance.liquidityEventDeposit({
          value: ethers.utils.parseEther(this.inputDeposit)
        });
        await tx.wait();
        await this.getJDFISBalance();
      } catch (e) {
        this.error = e.message;
      }

      this.loading = false;
    },

    format: function (bn) {
      return (Number(bn.toString()) / 1e18).toFixed(2);
    },
  },
}
</script>
