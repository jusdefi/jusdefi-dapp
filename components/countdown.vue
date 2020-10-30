<template>
  <div class="hero is-fullheight is-primary">
    <div class="hero-body">
      <div class="container">
        <div class="box">
          <div class="display container has-text-centered has-text-info">
            {{ display }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
let now = function () {
  let remaining = 1604692800 - Math.floor(new Date().getTime() / 1000);

  let seconds = Math.floor(remaining % 60);
  let minutes = Math.floor(remaining / 60 % 60);
  let hours   = Math.floor(remaining / (60 * 60) % 24);
  let days    = Math.floor(remaining / (60 * 60 * 24));

  return [days, hours, minutes, seconds].map(n => `${ n }`.padStart(2, '0')).join(':');
};

export default {
  data: function () {
    return {
      display: now(),
    }
  },

  mounted: function () {
    setInterval(function () {
      this.display = now();
    }.bind(this), 1000);
  },
}
</script>

<style>
  .display {
    font-size: 10em !important;
  }
</style>
