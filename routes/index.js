var async = require('async');
var escape = require('escape-html');
var express = require('express');
var fs = require('fs');
var marked = require('marked');
var path = require('path');
var router = express.Router();

var indexName = config['index-name'];

var siteName = config['site-root'];
var sitePath = path.join('.', siteName);

const ERR_NOT_DREW = 'err-not-drew';

/* GET home page. */
router.get('*', function(req, res, next) {
	var url = decodeURI(req.originalUrl).split('?').splice(0, 1)[0];

	if(path.sep === "\\"){
		url = url.replace("/", "\\");
	}else{
		url = url.replace("\\", "/");
	}

	if(url.charAt(url.length - 1) !== path.sep){
		url += path.sep;
	}

	url = url.replace("." + path.sep, "").replace(".." + path.sep, "");

	if(url.charAt(0) === path.sep){
		url = "." + url;
	}else{
		url = "." + path.sep + url;
	}

	var folderPath = path.join(sitePath, url);

	if(path.basename(folderPath) === indexName){
		res.redirect('/');
		return;
	}

	if(path.basename(folderPath) === siteName){
		folderPath = path.join(sitePath, indexName);
	}

	var scanStatus = undefined;
	var jsonStatus = undefined;

	var names = [];
	var info = [];

	//async1 : get navigations
	fs.readdir(sitePath, function(err, files){
		if(err){
			//console.log('async1 error');
			if(jsonStatus === undefined || jsonStatus === true || jsonStatus === ERR_NOT_DREW){
				res.status(404);
				res.render('error', {
					errorno: 404
				});
				scanStatus = false;
				return;
			}

			scanStatus = ERR_NOT_DREW;
			return;
		}

		var indexId = undefined;

		async.each(files, function(v, cb){
			//console.log('async1 ' + v);
			//console.log('async1 ' + path.join(sitePath, v, 'info.json'));

			if(v === indexName && global.config["navigation-no-index"]){
				cb();
				return;
			}

			fs.readFile(path.join(sitePath, v, 'info.json'), 'utf8', function(err, jsonData){
				if(err){
					cb();
					return;
				}

				jsonData = JSON.parse(jsonData);

				if(v === indexName){
					indexId = jsonData.name;
					cb();
					return;
				}

				names.push({
					name: jsonData.name,
					href: jsonData.redirect || v
				});

				cb();
			});
			//console.log('async1 ' + json);
		}, function(){
			//console.log('async1 finished');
			names.sort(function(val1, val2){
				return val1.name.localeCompare(val2.name);
			});

			if(indexName){
				names.unshift({
					name: indexId,
					href: indexName
				});
			}
			scanStatus = true;

			if(jsonStatus){
				render();
			}
		});
	});

	//async2: reading info.json
	fs.readFile(path.join(folderPath, 'info.json'), 'utf8', function(err, f){
		if(err){
			//console.log('async2' + err);

			if(scanStatus === undefined || scanStatus === true || scanStatus === ERR_NOT_DREW){
				res.status(404);
				res.render('error', {
					errorno: 404
				});
				jsonStatus = false;
				return;
			}

			jsonStatus = ERR_NOT_DREW;
			return;
		}
		//console.log('async2' + f);

		var json = JSON.parse(f);

		async.forEachOf(json.tiles, function(v, index, cb){
			//console.log('async2' + v + ',' + index);

			if(v["desc-target"]){
				fs.readFile(path.join(folderPath, v["desc-target"]), 'utf8', function(err, desc){
					switch(v.parse){
						case 'html': cb(); return;
						case 'markdown': json.tiles[index].desc = marked(desc); cb(); return;
					}

					json.tiles[index].desc = escape(desc).replace(/\r\n|\r|\n/g, '<br>');
					cb();
				});
			}else{
				switch(v.parse){
					case 'html': cb(); return;
					case 'markdown': json.tiles[index].desc = marked(v.desc); cb(); return;
				}

				json.tiles[index].desc = escape(v.desc).replace(/\r\n|\r|\n/g, '<br>');
				cb();
			}
		}, function(){
			//console.log('async2 finished');
			info = json;
			info.id = path.basename(folderPath);
			jsonStatus = true;

			if(scanStatus){
				render();
			}
		});
	});

	var render = function(){
		if(info.redirect !== undefined){
			res.redirect(info.redirect);
			return;
		}

		res.render('index', {
			info: info,
			navigation: names,
			path: path
		});
	};
});

module.exports = router;
