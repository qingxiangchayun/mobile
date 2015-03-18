/**
 * ajax-data-test
 *
 */

require(['jquery','jquery.tmpl'], function($) {

	'use strict';

	var htmlTmpl = [
		'<li class="list">',
			'<input type="text" value="${key}" class="key form-control" placeholder="key" />',
			'<input type="text" value="${value}" class="value form-control" placeholder="value" />',
			'<input type="checkbox" value="" {{if isChecked}}checked{{/if}} />',
			'<a class="del-btn" href="javascript:;">删除</a>',
		'</li>'
	].join('');

	// page load 
	var pageLoad = (function() {

		// 获取本地保存的数据
		var pageData = JSON.parse(localStorage.getItem('ajax-data-test'));
		console.log(pageData)
		// config 数据
		if (pageData) {
			$('.section-config input[name="url"]').val(pageData.config.url);
			$('.section-config input[name="dataType"]').val(pageData.config.dataType);

			if (pageData.config.type === 'GET') {
				$('.section-config .sc-type input').eq(0).prop('checked', true);
			} else {
				$('.section-config .sc-type input').eq(1).prop('checked', true);
			}

			// single data
			$.tmpl(htmlTmpl,pageData.data.singleData.list).appendTo('.params-wrap-single ul');
			
			// multiple data
			$.tmpl(htmlTmpl,pageData.data.multipleData.list).appendTo('.params-wrap-multiple ul');

			$('.params-wrap-multiple .multiple-key-list .key').val(pageData.data.multipleData.name);

		}else{
			// 初始化数据
			$.tmpl(htmlTmpl,[{},{},{}]).appendTo('.params-wrap-single ul');
			$.tmpl(htmlTmpl,[{},{}]).appendTo('.params-wrap-multiple ul');
		}

	})();

	
	// 验证接口
	$('#J_data_validate').on('click', function() {
		var $this = $(this);

		// 本地要存储的数据
		var storageData = {
			config: {
				url: '',
				type: ''
			},
			data: {
				singleData: {
					list: []
				},
				multipleData: {
					name: '',
					list: []
				}
			}
		};

		// ajax()方法的配置参数 每次点击都要初始化
		var ajaxConfig = {
			data: {}
		};

		// 用于关联本地存储数据和ajax配置数据 storageData.config = config = ajaxConfig中的config部分
		var config = {

		};

		// 配置数据
		config.url = $('.section-config input[name="url"]').val();
		config.type = $('.section-config .sc-type input:checked').val();
		config.dataType = $('.section-config input[name="dataType"]').val();
		config.jsonp = $('.section-config input[name="jsonp"]').val();

		storageData.config = config;

		$.extend(ajaxConfig,config);

		
		$('.params-wrap-single li').each(function() {
			var $this = $(this);

			var obj = {};

			var key = $this.find('.key').val();
			var value = $this.find('.value').val();
			var isChecked = $this.find('input[type="checkbox"]').prop('checked');

			obj.key = key;
			obj.value = value;
			obj.isChecked = isChecked;

			storageData.data.singleData.list.push(obj);

			if (isChecked && $.trim(key) ) {
				ajaxConfig.data[key] = value;
			}
		});

		// 真实的multipleKeyName值
		var multipleKeyName = storageData.data.multipleData.name = $('.params-wrap-multiple .multiple-key-list .key').val();
		var multipleKeyChecked = $('.params-wrap-multiple .multiple-key-list input[type="checkbox"]').prop('checked');
		var multipleDataList = [];

		$('.params-wrap-multiple .list').each(function() {
			var $this = $(this);
			var objForStorage = {};
			var objForAjax = {};

			var key = $this.find('.key').val();
			var value = $this.find('.value').val();
			var isChecked = $this.find('input[type="checkbox"]').prop('checked');

			objForStorage.key = key;
			objForStorage.value = value;
			objForStorage.isChecked = isChecked;

			storageData.data.multipleData.list.push(objForStorage);

			// ajax要发送的数据  验证要严格一些
			if ($.trim(multipleKeyName) && multipleKeyChecked  && isChecked && $.trim(key) ) {
				objForAjax.key = key;
				objForAjax.value = value;

				multipleDataList.push(objForAjax);
				ajaxConfig.data[multipleKeyName] = JSON.stringify(multipleDataList);
			}

		});

		// 数据写到 localStorage上
		window.localStorage.setItem('ajax-data-test', JSON.stringify(storageData));

		if(this.pms && this.pms.state() === 'pendding'){
			return;
		}

		this.pms = $.ajax(ajaxConfig);

		
		// 请求发出去之后置灰按钮
		$this.html('验证接口...').prop('disabled',true);
		$('#J_show_data').empty();

		this.pms.done(function(data) {
			$this.html('正在验证...')

			var inspector = new InspectorJSON({
				element : 'J_show_data',
				json  : data
			});
		});

		this.pms.always(function(){
			$this.prop('disabled',false);
		});

	});


	// add
	$('.section-params').on('click','.add-btn',function(){
		var $this = $(this);

		var $target = $(this).parents('.params-wrap-single').find('ul');

		if($this.data('type') === 'multiple'){
			$target = $(this).parents('.params-wrap-multiple').find('ul');
		}

		$.tmpl(htmlTmpl,{}).appendTo($target);
	});
	
	// delete
	$('.section-params').on('click','.del-btn',function(){
		$(this).parent('.list').remove();
	});

	// reset
	$('#J_params_reset').on('click',function(){
		$('.params-wrap input').val('');
	});
	
});
