// App.js

// dialog container
var popup_cont;
var session = {};
if(!wn) var wn = {};

function startup() {	
	popup_cont = $a(document.getElementsByTagName('body')[0], 'div');

	// Globals
	// ---------------------------------
	var setup_globals = function(r) {
		wn.boot = r;
		
		profile = r.profile;
		user = r.profile.name;		
		user_fullname = wn.user_info(user).fullname;
		user_defaults = profile.defaults;
		user_roles = profile.roles;
		user_email = profile.email;
		home_page = r.home_page;
		_p.letter_heads = r.letter_heads;

		sys_defaults = r.sysdefaults;
		// bc
		session.rt = profile.can_read;
		if(r.ipinfo) session.ipinfo = r.ipinfo;
		session.dt_labels = r.dt_labels;
		session.rev_dt_labels = {} // reverse lookup - get doctype by label
		if(r.dt_labels) {
			for(key in r.dt_labels)session.rev_dt_labels[r.dt_labels[key]] = key;
		}

		// control panel
		wn.control_panel = r.control_panel;
	}
	
	var setup_viewport = function() {
		wn.container = new wn.views.Container();
		
		// toolbar
		if(user=='Guest') 
			user_defaults.hide_webnotes_toolbar = 1;
		if(!cint(user_defaults.hide_webnotes_toolbar) || user=='Administrator') {
			wn.container.wntoolbar = new wn.ui.toolbar.Toolbar();
		}

		// startup code
		$(document).trigger('startup');
		try{
			if(wn.control_panel.custom_startup_code)
				eval(wn.control_panel.custom_startup_code);
		} catch(e) {
			errprint(e);
		}
				
		// open an existing page or record
		var t = to_open();
		if(t) {
			window.location.hash = t;
		} else if(home_page) {
			loadpage(home_page);
		}
		wn.route();

		$dh('startup_div');
		$ds('body_div');
	}
	
	var callback = function(r,rt) {
		if(r.exc) console.log(r.exc);
		setup_globals(r);
		setup_viewport();
	}
	
	if(wn.boot) {
		LocalDB.sync(wn.boot.docs);
		callback(wn.boot, '');
		if(wn.boot.error_messages)
			console.log(wn.boot.error_messages)
		if(wn.boot.server_messages) 
			msgprint(wn.boot.server_messages);
	} else {
		if($i('startup_div'))
			$c('startup',{},callback,null,1);
	}
}

function to_open() {
	if(get_url_arg('page'))
		return get_url_arg('page');
	var h = location.hash;
	if(h) {
		return h.substr(1);
	}
}

function logout() {
	$c('logout', args = {}, function(r,rt) { 
		if(r.exc) {
			msgprint(r.exc);
			return;
		}
		redirect_to_login();
	});
}

function redirect_to_login() {
	if(login_file) 
		window.location.href = login_file;
	else {
		window.location.reload();		
	}
}

// default print style
_p.def_print_style_body = "html, body, div, span, td { font-family: Arial, Helvetica; font-size: 12px; }" + "\npre { margin:0; padding:0;}"	

_p.def_print_style_other = "\n.simpletable, .noborder { border-collapse: collapse; margin-bottom: 10px;}"
	+"\n.simpletable td {border: 1pt solid #000; vertical-align: top; padding: 2px; }"
	+"\n.noborder td { vertical-align: top; }"

_p.go = function(html) {
	var d = document.createElement('div')
	d.innerHTML = html
	$(d).printElement();
}

_p.preview = function(html) {
	var w = window.open('');
	w.document.write(html)
	w.document.close();
}

var resize_observers = []
function set_resize_observer(fn) {
	if(resize_observers.indexOf(fn)==-1) resize_observers.push(fn);	
}
window.onresize = function() {
	return;
	var ht = get_window_height();
	for(var i=0; i< resize_observers.length; i++){
		resize_observers[i](ht);
	}
}

get_window_height = function() {
	var ht = window.innerHeight ? window.innerHeight : document.documentElement.offsetHeight ? document.documentElement.offsetHeight : document.body.offsetHeight;
	return ht;
}
