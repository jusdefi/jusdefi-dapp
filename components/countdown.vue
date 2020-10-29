<template>
  <div class="hero is-fullheight is-primary">
    <div class="hero-body">
      <div class="container">
        <div class="box">
          <div class="display container has-text-centered">
            {{ display }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      display: 0,
      deadline: 1604088000,
    }
  },

  mounted: function () {
    this.update();
    setInterval(function () {
      this.update();
    }.bind(this), 1000);
  },

  methods: {
    update: function () {
      let remaining = this.deadline - Math.floor(new Date().getTime() / 1000);
      this.display = remaining;
    },
  },
}
</script>

<style>
  .display {
    font-size: 10em !important;
  }
</style>
