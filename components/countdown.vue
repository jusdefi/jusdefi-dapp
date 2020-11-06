<template>
  <div class="container">
    <div class="box">
      <div class="time-left container has-text-centered has-text-info">
        {{ timeLeft }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      deadline: 1604692800,
      timeLeft: this.formatTimeRemaining(1604692800),
    };
  },

  mounted: function () {
    setInterval(function () {
      this.timeLeft = this.formatTimeRemaining(this.deadline);
    }.bind(this), 1000);
  },

  methods: {
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

<style>
  .time-left {
    font-size: 10em !important;
  }
</style>
