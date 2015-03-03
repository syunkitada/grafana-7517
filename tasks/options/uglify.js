module.exports = function(config) {
  return {
    dest: {
      expand: true,
      src: ['**/*.js', '!dashboards/*.js'],
      dest: '<%= destDir %>',
      cwd: '<%= destDir %>',
      options: {
        quite: true,
        compress: true,
        preserveComments: false,
        banner: '<%= meta.banner %>'
      }
    }
  };
};
