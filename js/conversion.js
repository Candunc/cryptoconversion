var row1_data = [
	"ZEC",
	"BTC",
	"ETH"
]
var row2_data = [
	"BTC",
	"ETH"
]
var row3_data = [
	"USD"
]

var conversion = null;

// Inspired by elclanrs, https://stackoverflow.com/a/21843059
function populateSelect(select, data) {
	var frag = document.createDocumentFragment();
	data.forEach(function(option) {
		var opt = document.createElement('option');
		opt.text = option;
		frag.appendChild(opt);
	});
	select.appendChild(frag.cloneNode(true));
}

function updateGUI() {
	// currencies
	var row1_cur = document.getElementById('row1').value;
	var row2_cur = document.getElementById('row2').value;
	var row3_cur = document.getElementById('row3').value;

	// Quick change as Poloniex doesn't have direct USD.
	if (row3_cur == "USD") {
		row3_cur = "USDT";
	}

	// numeric values
	var row1_val = document.getElementById('row1-val');
	var row2_val = document.getElementById('row2-val');
	var row3_val = document.getElementById('row3-val');
	var row4_val = document.getElementById('row4-val');

	if (row1_cur === row2_cur) {
		row2_val.value = "1.00000000"
	} else {
		row2_val.value = conversion[row2_cur + "_" + row1_cur]['last'];
	}

	row3_val.value = conversion[row3_cur + "_" + row2_cur]['last'];
	row4_val.value = row1_val.value * row2_val.value * row3_val.value;
}

function resetGUI() {
	updateConversion();
	var row1_val = document.getElementById('row1-val');
	var row2_val = document.getElementById('row2-val');
	var row3_val = document.getElementById('row3-val');
	var row4_val = document.getElementById('row4-val');

	row1_val.value = "0.00000000";
	row4_val.value = "0.00";

}

function updateConversion() {
	var lastUpdate = localStorage.getItem("exchange_lastUpdate");
	var currentTime = + new Date(); // Credit to daveb, https://stackoverflow.com/a/221297
	if (conversion == null || !lastUpdate || (currentTime - lastUpdate) > 60) {
		$.getJSON('https://poloniex.com/public?command=returnTicker', function(data) {
			conversion = data;
			localStorage.setItem("exchange_lastUpdate",currentTime);
			updateGUI();
		});
	}
}

// Populate columns on page load
populateSelect(document.getElementById('row1'),row1_data);
populateSelect(document.getElementById('row2'),row2_data);
populateSelect(document.getElementById('row3'),row3_data);
resetGUI();