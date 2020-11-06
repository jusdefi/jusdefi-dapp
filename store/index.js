import Vue from 'vue';
import Vuex from 'vuex';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

Vue.use(Vuex);

export default function () {
  return new Vuex.Store({
    state: function () {
      return {
        currentNetwork: null,
        currentAccount: null,
        provider: null,
        connected: false,
      };
    },
    mutations: {
      setNetwork: function (state, payload) {
        state.currentNetwork = payload;
      },

      setAccount: function (state, payload) {
        state.currentAccount = payload;
      },

      setProvider: function (state) {
        state.provider = new ethers.providers.Web3Provider(global.ethereum);
      },
    },
    actions: {
      connect: async function (context) {
        const provider = await detectEthereumProvider();

        if (provider) {
          provider.on('networkChanged', function (payload) {
            context.commit('setNetwork', payload);
          });
          context.commit('setNetwork', provider.networkVersion);

          provider.on('accountsChanged', function (payload) {
            context.commit('setAccount', payload[0]);
          });
          context.commit('setAccount', provider.selectedAddress);

          provider.enable();

          context.commit('setProvider');
        } else {
          alert('Metamask is required to use this application.  See https://metamask.io/.');
        }
      },
    },
    getters: {
      currentNetwork: state => state.currentNetwork,
      currentAccount: state => state.currentAccount,
      provider: state => state.provider,
      connected: state => !!state.currentAccount,
    },
  });
}
