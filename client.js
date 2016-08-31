var Controller = {};

Controller.Blog = {
	page: 1,

	more: function () {
		$.get('/index/list', {page: Controller.Blog.page}, function (html) {
			$('#blog-items').append(html);
			Controller.Blog.page++;
		});
		return false;
	},

	hide: function () {
		$('.more-items').hide();
	}
};

Controller.User = {
	registration: function(obj) {
		$('#registration').addClass('show');
		return false;
	}, 

	cancelRegistration: function(obj) {
		$('#registration').removeClass('show');
		return false;
	},

	auth: function(obj) {
		$("#autorization").addClass("show");
		return false;
	},

	cancelAuth: function(obj) {
		$("#autorization").removeClass("show");
		return false;
	}
}

Controller.Cart = {
	add: function(obj) {
		$.get('/shop/add', {tax: obj.attr('data-tax')}, function (data) {
			if(data.valid == false)
				return Controller.Modal.error('Не удалось добавить в корзину');

			$('.wish-icon span').text(data.count);
			return Controller.Modal.success('Товар добвлен в корзину');
		}, 'json');

		return false;
	},

	remove: function (obj) {
		var index = obj.attr('data-index');
		$.get('/shop/remove', {index: index}, function (data) {
			$('[data-index="'+index+'"]').parent().remove();
			$('.wish-icon span').text(data.count);
			$('.wish-item.itog .wish-item-price').text(data.price);

			if(data.price == 0)
				window.location.href = '/shop';
		},'json');
	},

	radio: function (obj) {
        $(".pay-radio").removeClass("active");
        obj.addClass("active");
	},

	pay: function (obj) {
		if(obj.attr('data-type') == 1)
			window.location.href = '/shop/check';

		return false;
	}
}

$(document).ready(function () {
	// detect some clicks
	$(document).on('click', 'a, span, div, button, [type="button"]', function(e) {
		if($(this).attr('data-act') == undefined)
			return true;

		var ca = $(this).attr('data-act').split('.');
		var controllerName = ca[0];
		var actionName = ca[1];

		if(controllerName != undefined) {
			if(actionName != undefined)
				return Controller[controllerName][actionName]($(this), e);
			else
				return Controller[controllerName].init($(this), e);
		}
	});

	// close modal window by press esc
	$(document).keyup(function(e) {
		if (e.keyCode == 27) {
			Controller.Map.close();
			Controller.Modal.close();
		}
	});

	$(window).resize(function () {
		$('#all-content').css({
			'min-height': $(window).height() - 200
		})
	});

	$(window).resize();
	
});