#!/usr/bin/env node --harmony_proxies

// Modules
var fs = require('fs');
var _ = require('underscore');
var Mustache = require('mustache');
/*var Reflect =*/ require('harmony-reflect');

// Test harmony availability
new Proxy({}, {});

// Utilities
var die = function(msg) {
	console.error(msg);
	process.exit(1);
};

// Command line
var profileName = process.argv
	&& process.argv.length >= 3
	&& process.argv[2]
    || die('Please specify a profile.');

// Control file
var controlFilename = "conflagrate.json";
var control;
try {
	control = JSON.parse(fs.readFileSync(controlFilename));
} catch (err) {
	die("Unable to read control file '" + controlFilename + "'.");
}

// Load profile
var controlProfiles = control.profiles || {};
var profile = controlProfiles[profileName]
	|| die("Profile '" + profileName + "' not defined.");
var model = {};
profile.forEach(function(configFilename) {
	_(model).extend(JSON.parse(fs.readFileSync(configFilename)));
});

// Insert proxy for fail-fast model property access
model = new Proxy(model, {
	get: function(target, property) {
		if (!(property in target)) {
			throw new Error("Property '" + property + "' not found.");
		}
		return target[property];
	}
});

// Process templates
var controlTemplates = control.templates || {};
for (var templateFilename in controlTemplates) {
	if (controlTemplates.hasOwnProperty(templateFilename)
		&& controlTemplates[templateFilename]) {

		var outputFilename = templateFilename;

		// Guess output filename for defaults file.
		var matchTemplateIsDefaultsFile = /^(.*[^/]+)[^/:alnum:]default$/.exec(templateFilename);
		if (matchTemplateIsDefaultsFile) {
			outputFilename = matchTemplateIsDefaultsFile[1];
		}

		var template = String(fs.readFileSync(templateFilename));
		var output = Mustache.render(String(template), model);
		fs.writeFileSync(outputFilename, output);
	}
}
