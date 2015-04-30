define(function(){
    var instance = null;
 
    function User(data){
        if(instance !== null){
            throw new Error("Cannot instantiate more than one MySingleton, use MySingleton.getInstance()");
        } 
        this.initialize(data);
    }

    User.prototype = {
        initialize: function(data){
        },
				setLocation: function(cb){
					var self = this;
					window.navigator.geolocation.getCurrentPosition(function(pos){
						console.log(pos);
						self.location = pos;
					}, function(err){
						console.log(err);
					});
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
