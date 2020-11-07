import Vue from 'vue';
import Vuex from 'vuex';
import { ethers } from 'ethers';


Vue.use(Vuex);

export default function () {
  return new Vuex.Store({
    state: function () {
      return {
        currentNetwork: null,
        currentAccount: null,
        provider: null,
        connected: false,
        connecting: false,
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

      setConnecting: function (state, payload) {
        state.connecting = payload;
      },
    },
    actions: {
      connect: async function (context) {
        context.commit('setConnecting', true);

        let provider = await global.detectEthereumProvider({ timeout: 15000 });

        provider = provider || global.ethereum;

        if (provider) {
          provider.enable();
          context.commit('setProvider');

          provider.on('networkChanged', function (payload) {
            context.commit('setNetwork', payload);
          });
          context.commit('setNetwork', provider.networkVersion);

          provider.on('accountsChanged', function (payload) {
            context.commit('setAccount', payload[0]);
          });
          context.commit('setAccount', provider.selectedAddress);
        } else {
          alert('Metamask is required to use this application.  See https://metamask.io/.');
        }

        context.commit('setConnecting', false);
      },
    },
    getters: {
      currentNetwork: state => state.currentNetwork,
      currentAccount: state => state.currentAccount,
      provider: state => state.provider,
      connected: state => !!state.currentAccount,
      connecting: state => state.connecting,
    },
  });
}
