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

var lockfile = {
	"row1":false,
	"row2":false,
	"row3":false,
	"row4":false
}

/*
TODO: Build a proper currency conversion function that handles errors and flips currency if required.

*/

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

function updateLock(lock) {
	lockfile[lock] = !lockfile[lock];
	updateGUI();
}

function getGUIStatus() {
	var status = {};
	var iterate = null;

	// Avoid type errors due to ajax waiting.
	if (conversion == null) {
		for (var i = 4; i > 0; i--) {
			iterate = 'row' + i;
			status[iterate] = {};
			status[iterate]['lock_element'] = document.getElementById(iterate+'-lock');
		}
	} else {
		for (var i = 4; i > 0; i--) {
			iterate = 'row' + i;
			status[iterate] = {};

			status[iterate]['currency_element'] = document.querySelectorAll("[data-id='"+iterate+"']")[0];
			status[iterate]['value_element'] = document.getElementById(iterate+'-val');
			status[iterate]['lock_element'] = document.getElementById(iterate+'-lock');
			status[iterate]['currency'] = status[iterate]['currency_element'];
			status[iterate]['value'] = status[iterate]['value_element'].value;
		}
	}

	return status;
}

function updateGUI() {
	var status = getGUIStatus();

	// I originally had locks on each row, however it's only required to have locks on rows 2 and 3.
	var iterate = null;
	for (var i = 3; i > 1; i--) {
		iterate = "row" + i;
		if (lockfile[iterate]) {
			status[iterate]['lock_element'].src = 'img/1f512.svg';
			status[iterate]['lock_element'].onerr = "this.src='img-1f512.png'";
			status[iterate]['lock_element'].alt = 'locked';
		} else {
			status[iterate]['lock_element'].src = 'img/1f513.svg';
			status[iterate]['lock_element'].onerr = "this.src='img-1f513.png'";
			status[iterate]['lock_element'].alt = 'unlocked';
		}
	}

	// Avoid type errors due to ajax waiting.
	if (conversion == null)
		return false;

	// Quick change as Poloniex doesn't have direct USD
	if (status['row3']['currency'] == 'USD') {
		status['row3']['currency'] = 'USDT';
	}

	if (!lockfile['row2']) {
		if (status['row1']['currency'] === status['row2']['currency']) {
			status['row2']['value_element'].value = '1.00000000'
		} else {
			//see todo
			status['row2']['value_element'].value = conversion[status['row2']['currency'] + "_" + status['row1']['currency']]['last'];
		}
	}

	if (!lockfile['row3'])
		status['row3']['value_element'] = conversion[status['row3']['currency'] + '_' + status['row2']['currency']]['last'];
	
	status['row4']['value_element'] = status['row1']['value'] * status['row2']['value'] * status['row3']['value'];
}

function resetGUI() {
	var status = getGUIStatus();

	for (var i = 4; i > 0; i--) {
		lockfile['row'+i] = false;
	}

	updateConversion();
}

function updateConversion() {
	$.getJSON('https://poloniex.com/public?command=returnTicker', function(data) {
		conversion = data;
		updateGUI();
	});
}

// Populate columns on page load
populateSelect(document.getElementById('row1'),row1_data);
populateSelect(document.getElementById('row2'),row2_data);
populateSelect(document.getElementById('row3'),row3_data);

/*
window.setInterval(function(){
	updateConversion();
}, 15000);
*/