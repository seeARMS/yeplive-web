define(['jquery','underscore','backbone','lib/models/user'],
	function($, _, Backbone, UserModel){
    var instance = null;
 
    function User(data){
        if(instance !== null){
            throw new Error("Cannot instantiate more than one MySingleton, use MySingleton.getInstance()");
        } 
        this.initialize(data);
    }

    User.prototype = {
        initialize: function(data){
					this.user = new UserModel();
        },
				setLocation: function(cb){
					var self = this;
					var latitude = window.localStorage.getItem('latitude');
					var longitude= window.localStorage.getItem('longitude');
					if(! latitude){
					window.navigator.geolocation.getCurrentPosition(function(pos){
						self.user.set('latitude', pos.coords.latitude);
						self.user.set('longitude', pos.coords.longitude);
						window.localStorage.setItem('latitude', pos.coords.latitude);
						window.localStorage.setItem('longitude', pos.coords.longitude);
						cb(null, true);
						
					}, function(err){
						alert('you must set location to be able to stream');
						console.log(err);
					});
					} else {
						self.user.set('latitude', latitude);
						self.user.set('longitude', longitude);
						cb(null, true);
					}
				},
				getLocation: function(){
					return location;
				}
    };
    User.getInstance = function(data){
        if(instance === null){
            instance = new User(data);
        }
        return instance;
    };
 
    return User.getInstance();

});
