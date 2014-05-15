Number.prototype.isInt = function(){
	return this % 1 === 0;
};

var Zeros = function(){
	var t = 6, g = 980, m = 75000;

	// f(x)
	this.f = function(c){
		return (((g * m) / c) * (1 - Math.exp(-1 * ((c * t) / m)))) - 3600;
		//return (73500000 * (1 - Math.exp(-c / 12500))) / c;
	};

	// Método bissecção
	this.bisection = function(a, b, i, obj){
		var x = (a + b) / 2,
				fx = this.f(x),
				ba = b - a;

		if(!obj) obj = {method: "Bissecção", row : []};

		obj.row.push({
			i: i,
			a: (a.isInt()) ? a : a.toFixed(6),
			b:(b.isInt()) ? b : b.toFixed(6),
			x: (x.isInt()) ? x : x.toFixed(6),
			fx: (fx.isInt()) ? fx : fx.toFixed(6),
			ba: (ba.isInt()) ? ba : ba.toFixed(6)
		});

		if(fx.toFixed(1) != 0){
			if(fx > 0) return this.bisection(x, b, ++i, obj);
			else return this.bisection.call(this, a, x, ++i, obj);
		}else{
			return obj;
		}
	};

	// Método falsa posicao
	this.falsePosition = function(a, b, i, obj){

		var fa = Math.abs(this.f(a)),
				fb = Math.abs(this.f(b)),
				x = ((a * fb) + (b * fa)) / (fa + fb),
				fx = this.f(x),
				ba = b - a;

		if(!obj) obj = {method: "Falsa Posição", row : []};

		obj.row.push({
			i: i,
			a: (a.isInt()) ? a : a.toFixed(6),
			b:(b.isInt()) ? b : b.toFixed(6),
			x: (x.isInt()) ? x : x.toFixed(6),
			fx: (fx.isInt()) ? fx : fx.toFixed(6),
			ba: (ba.isInt()) ? ba : ba.toFixed(6)
		});

		if(fx.toFixed(1) != 0 && i < 5){
			return this.falsePosition.call(this, a, x, ++i, obj);
		}else{
			return obj;
		}
	};

	// Método secante
	this.secant = function(a, b, i, obj){
		var x = (a * this.f(b) - b * this.f(a))/(this.f(b) - this.f(a)),
				fx = this.f(x),
				ba = b - a;

		if(!obj) obj = {method: "Secante", row : []};

		obj.row.push({
			i: i,
			a: (a.isInt()) ? a : a.toFixed(6),
			b:(b.isInt()) ? b : b.toFixed(6),
			x: (x.isInt()) ? x : x.toFixed(6),
			fx: (fx.isInt()) ? fx : fx.toFixed(6),
			ba: (ba.isInt()) ? ba : ba.toFixed(6)
		});

		if(fx.toFixed(1) != 0){
			return this.secant.call(this, b, x, ++i, obj);
		}else{
			return obj;
		}
	}
};

var Sistema = function(){
	// Primeira linha do sistema
	function f1(x1, x2){
		return (16 * x1 - Math.cos(x2 - 2 * x1)).toFixed(6);
	};

	// Segunda linha do sistema
	function f2(x1, x2){
		return (16 * x2 + 0.75 * Math.sin(-x2 - 3 * x1)).toFixed(6);
	};

	// Jacobiana
	j = [
		[
			function(x1, x2){
				return (16 - 2 * Math.sin(x2 - 2 * x1)).toFixed(6);
			},
			function(x1, x2){
				return Math.sin(x2 - 2 * x1).toFixed(6);
			}
		],
		[
			function(x1, x2){
				return (-2.25 * Math.cos(-x2 - 3 * x1)).toFixed(6);
			},
			function(x1, x2){
				return (16 - 0.75 * Math.cos(-x2 - 3 * x1)).toFixed(6);
			}
		]
	];

	//	Retorna a matriz jacobiana
	this.matrix = function(x1, x2){
		return [
			[
				j[0][0](x1, x2),
				j[0][1](x1, x2)
			],
			[
				j[1][0](x1, x2),
				j[1][1](x1, x2)
			]
		];
	};

	// Retorna vetor de resultados do sistema f(x1, x2)
	this.result = function(x1, x2){
		return [
			f1(Number(x1), Number(x2)),
			f2(Number(x1), Number(x2))
		];
	};

	this.newton = function(x1, x2, i, obj){
		var matrix = this.matrix(x1, x2),
				pivot = matrix[1][0] / matrix[0][0],
				result = this.result(x1, x2);

		if(!obj) obj = {row : []};

		temp = {
			i: i,
			x1: x1,
			x2: x2,
			pivot: pivot,
			result: this.result(x1, x2),
			matrix: this.matrix(x1, x2),
		};

		matrix[1][0] = matrix[1][0] - matrix[0][0] * pivot;
		matrix[1][1] = matrix[1][1] - matrix[0][1] * pivot;
		result[1] = result[1] - result[0]	* pivot;

		deltaX2 = -result[1] / matrix[1][1];

		deltaX1 = (-result[0] - deltaX2 * matrix[0][1]) / matrix[0][0];

		temp.deltaX1 = deltaX1;
		temp.deltaX2 = deltaX2;

		x1 += deltaX1;
		x2 += deltaX2;

		temp.newX1 = Number(x1).toFixed(6);
		temp.newX2 = Number(x2).toFixed(6);

		var newResult = this.result(x1, x2);
		var stop = Math.sqrt(Math.pow(newResult[0], 2) + Math.pow(newResult[1], 2));

		temp.newResult = newResult;
		temp.stop = stop;

		obj.row.push(temp);

		if(stop > 0.05){
			return this.newton.call(this, x1, x2, ++i, obj);
		}else{
			return obj;
		}
	};
};

// Motor
;(function($, window, document, undefined){
	// Construtor
	var Trabalho = function(){
		this.init();
	};

	// Classe
	Trabalho.prototype = (function(){
		var zero = new Zeros();
		var sistema = new Sistema();

		return {
			constructor : Trabalho,
			init : function(){
				Mustache.parse($('#method-template').html());
				Mustache.parse($('#zeros-table-template').html());
				Mustache.parse($('#sistemas-table-template').html());

				// console.log(zero.bisection(10000, 15000, 1));
				// console.log(zero.falsePosition(10000, 15000, 1));
				// console.log(zero.secant(10000, 15000, 1));

				// console.log(sistema.newton(0.1, 0.01, 1));

				$(document).on("change", "#problem", function(){
					switch($(this).val()){
						case "zero" : {
							$("#method-wrap").html("Escolha qual método usar" + Mustache.render($('#method-template').html(), {}));
						};break;
						case "sistema" : {
							$("#method-wrap").html('');
							$("#table-wraper").html(Mustache.render($('#sistemas-table-template').html(), sistema.newton(0.1, 0.01, 1)));
						};break;
						default : {
							$("#method-wrap").html('');
						}
					}
				});

				$(document).on("change", "#method", function(){
					var value = $(this).val();

					if(value){
						 $("#table-wraper").html(Mustache.render($('#zeros-table-template').html(), zero[value](10000, 15000, 1)));
					}
				});
			}
		};
	})();

	if(!window.$trabalho){
		window.$trabalho = new Trabalho();
	}
})(jQuery, window, document);