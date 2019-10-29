
function create_header() {
	var links = 
	'<a href="main.html">Home</a>' +
	'<a href="#consultant">Consultants</a>';

	var type = localStorage.getItem('type');
	var user_name = localStorage.getItem('user_name');

	if (type != null) {
		// logged in
		if (type == "doctor") {
			links += '<a href="list.html">Doctor\'s Scehdule</a>';
		}
		else if (type == "patient") {	
			links += '<a href="booking.html">Book an appointment</a>';
		}

		links += '<a onClick="logout();" href="#">logout</a>';
		
	}
	else {
		// logged out
		links += '<a href="login.html">login</a>';
	}
	
	$("#my-header").html(links);				
}

function logout() {
	localStorage.removeItem('type');
	localStorage.removeItem('user_name');

	window.location.href = "login.html";
}

function login() {
		
	// get form data
	var user_name = $("#user_name").val();
	var password = $("#password").val();
	alert('sending AJAX request');

	$.ajax({
		url: "http://localhost:5000/login",
		type: "POST",
		data: {
			user_name: user_name,
			password: password,
		},
		cache: false,

		// callback, called async
		success: function(result) {
			//alert(result);
			
			if(result=="no user"){
				alert('no user');
				window.location.href = "login.html";
			}
			else if(result=="incorrect password"){
				alert('incorrect password');
				window.location.href = "login.html";
			}
			else if(result=="patient")
			{
				alert('Welcome patient ' + user_name);
				localStorage.setItem('user_name', user_name);
				localStorage.setItem('type', 'patient');
				window.location.href = "list.html";
			}
			else if(result=="doctor")
			{
				alert('Welcome doctor '+user_name);
				localStorage.setItem('user_name', user_name);
				localStorage.setItem('type', 'doctor');
				window.location.href = "list.html";
			}
				
		},
	});

	return false;
}

function register() {
	// get form data
	var user_name = $("#user_name").val();
	var password = $("#password").val();
	var name = $("#name").val();
	var type = $("#type").val();
	//alert('sending AJAX request');

	$.ajax({
		url: "http://localhost:5000/register_appointment",
		type: "POST",
		data: {
			user_name: user_name,
			password: password,
			name: name,
			type: type,
		},
		cache: false,

		// callback, called async
		success: function(result) {
			alert("thanks for registering!");
			window.location.href = "login.html";
		},
	});
}


function submit_booking() {
	// get form data
	var name = $("#name").val();
	var phone = $("#phone").val();
	var datepicker = $("#datepicker").val();
	var time = $("#time").val();
	var message = $("#message").val();
	var doctor = $("#doctor").val();
	//alert('sending AJAX request');

	$.ajax({
		url: "http://localhost:5000/book_appointment",
		type: "POST",
		data: {
			name: name,
			phone: phone,
			datepicker: datepicker,
			time: time,
			message: message,
			doctor: doctor,
		},
		cache: false,

		// callback, called async
		success: function(result) {
			alert(result);
			window.location.href = "list.html";
		},
	});
}

function cancel_appointment(name,date,doctor)
{
	$.ajax({
		url: "http://localhost:5000/cancel_appointment",
		type: "POST",
		data: {
			name: name,
			date: date,
			doctor:doctor,
		},
		cache: false,

		// callback, called async
		success: function(result) {
			alert("Cancelled");
			window.location.href = "list.html";
		},
	});
}

function load_appointments() {

	var type = localStorage.getItem('type');
	var user_name = localStorage.getItem('user_name');

	// get current list of bookings
	$.ajax({
		url: "http://localhost:5000/get_appointments",
		data: {
			user_name: user_name,
			type: type,
		},
		type: "GET",
		cache: false,

		// callback, called async
		success: function(bookings) {

			  if (bookings.length == 0) {
			    alert("No appointments");
			    return;
			  }

			  var tbody = $("tbody#bookings");

			  for (var i =0; i < bookings.length; i++) {
			    let tr = "<tr>" +
			      "<td>" + bookings[i].name + "</td>" +
			      "<td>" + bookings[i].phone + "</td>" +
				  "<td>" + bookings[i].date + "</td>" +
				  "<td>" + bookings[i].doctor + "</td>" +
				  "<td>" + bookings[i].time + "</td>" +
				  "<td>" + bookings[i].message + "</td>" +
				  "<td>" + "<button onclick=\"cancel_appointment('"
				  + bookings[i].name + "', '" + bookings[i].date + "','" + bookings[i].doctor +"');\">cancel</button>" + "</td>" +
			      "</tr>";

			    tbody.append(tr);
			  }
		},
	});

}

