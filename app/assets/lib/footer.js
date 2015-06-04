define(['jquery',
		'underscore',
		'text!lib/templates/footer/terms-of-use.html',
		'text!lib/templates/footer/privacy-policy.html',
		'text!lib/templates/footer/content-policy.html'],

	function($, _, tou, pp, cp){

		var termsOfUse = _.template(tou);
		var privacyPolicy = _.template(pp);
		var contentPolicy = _.template(cp);

		$('.footer-terms-of-use').on('click', function(){
			$('#terms-of-use-modal').html(termsOfUse);
			$('.terms-of-use-modal').modal('toggle');
		});

		$('.footer-privacy-policy').on('click', function(){
			$('#privacy-policy-modal').html(privacyPolicy);
			$('.privacy-policy-modal').modal('toggle');
		});

		$('.footer-content-policy').on('click', function(){
			$('#content-policy-modal').html(contentPolicy);
			$('.content-policy-modal').modal('toggle');
		});

	}
);