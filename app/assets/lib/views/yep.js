define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/yep.html'
], function($, _, Backbone, projectListTemplate){
  var YepView = Backbone.View.extend({
    el: $('#container'),
    render: function(){
      // Using Underscore we can compile our template with data
      var data = {};
      var compiledTemplate = _.template( projectListTemplate, data );
      // Append our compiled template to this Views "el"
      this.$el.append( compiledTemplate );
    }
  });
  // Our module now returns our view
  return YepView;
});
