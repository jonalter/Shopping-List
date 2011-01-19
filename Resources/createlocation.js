// View used to create a new Location

var win = Titanium.UI.currentWindow;
win.backgroundColor = '#13386c';
var navGroup = win.navGroup;

var newName = '';

var locationLabel = Titanium.UI.createLabel({
	color: '#fff',
	text: 'Location',
	top: 30,
	left: 10,
	width: 'auto',
	height: 'auto'
});

var nameTextField = Titanium.UI.createTextField({
	color: '#336699',
	top: 60,
	left: 10,
	width: 300,
	height: 40,
	hintText: 'name',
	keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
	borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});
nameTextField.addEventListener('return', function (e) {
	nameTextField.blur();
});

win.addEventListener('click', function (e) {
	nameTextField.blur();
});

var createButton = Titanium.UI.createButton({
	title: 'Add'
});
createButton.addEventListener('click', function () {
	newName = nameTextField.value;
	// Add the new item to the database
	var db = Ti.Database.install('shoppingDB.sql', '');
	if (newName) {
		var locationRS = db.execute('SELECT id FROM location WHERE name=(?)', newName);
		if (locationRS.rowCount == 0) {
			db.execute('INSERT into location (name) VALUES (?)', newName);
			var idRS = db.execute('SELECT id FROM location WHERE name=(?)', newName);
			var lastInsertId;
			if (idRS.isValidRow()) { 
				lastInsertId = idRS.fieldByName('id');
			}
			// custom event to add item to table view
			Ti.App.fireEvent('addLocationToView', { 
				title: newName, 
				locId: lastInsertId 
			});
			// alert confirmation
			alert(newName + " added");
			nameTextField.value = '';
		}else{
			alert(newName +' already exists');
		}
		locationRS.close();
	}else{
		alert('Name can\'t be blank');
	}
	
	db.close();
});

// Add UI elements to window
win.rightNavButton = createButton;
win.add(locationLabel);
win.add(nameTextField);
