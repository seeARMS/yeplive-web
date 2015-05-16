define(['jquery'], function($){

    helper = {
        timeElapsedCalculator : function(diff){
            if (diff < 60){
                return 'Just Now';
            }
            else if (diff < 3600){
                var min = Math.floor(diff/60);
                if (min === 1){
                    return '1 minute ago';
                }
                else{
                    return min.toString() + ' minutes ago';
                }
            }
            else if (diff < 86400){
                var hr = Math.floor(diff/60/60);
                if (hr === 1){
                    return '1 hour ago'
                }
                else{
                    return hr.toString() + ' hours ago';
                }
                
            }
            else if (diff < 2592000){
                var day = Math.floor(diff/60/60/24);
                if (day === 1){
                    return '1 day ago'
                }
                else{
                    return day.toString() + ' days ago';
                }
            }
            else if (diff < 31536000){
                var month = Math.floor(diff/2592000);
                if (month === 1){
                    return '1 month ago'
                }
                else{
                    return month.toString() + ' months ago';
                }
            }
            else{
                return 'more than a year ago';
            }
        },
        videoDurationConverter : function(seconds){
            if(seconds < 60){
                if(seconds < 10){
                    seconds = '0' + seconds.toString();
                }
                else{
                    seconds = seconds.toString();
                }
                return '00:' + seconds
            }
            else if(seconds >= 60){
                var minutes = Math.floor(seconds / 60);
                seconds = seconds - ( minutes * 60 );

                if(seconds < 10){
                    seconds = '0' + seconds.toString();
                }
                else{
                    seconds = seconds.toString();
                }

                if(minutes < 10){
                    minutes = '0' + minutes.toString();
                }
                else{
                    minutes = minutes.toString();
                }

                return minutes.toString() + ':' + seconds;
            }
        }
    };

    return helper;
});