# Archi-tekt
Build a website with json!

## How to build?
### Make a navigation object.
1. Add new folder in site folder. (index folder will be the default directory.)
2. Add info.json.

### Edit the info.json
Here is a template json file.
```
{
	"name": "Home", //This will be shown in the navigation.
	"tiles": [
		{
			"name": "foo",
			"desc": "A tile to test.",
			"parse": "plain", //markdown, html, plain
			"href": "foo.html",
			"color": "#FFFFFF",
			"background-color": "#0080FF",
			"text-color": "#FFFFFF",
			"type": "small-card", //small-card.ejs will be loaded from plugins directory.
			"height": "200px",
			"width": "300px",
			"href-text": "More about"
		},

		{
			"name": "foo",
			"desc-target": "aa.md", //The desc will be the content of aa.md. (in the same directory of info.json)
			"parse": "plain", //markdown, html, plain
			"href": "foo.html",
			"color": "#FFFFFF",
			"background-color": "#202020",
			"text-color": "#FFFFFF",
			"type": "jumbotron"
		}
	]
}
```

### Make a navigation object redirect.
Add
```
"redirect": "site"
```
in your info.json.

### Tips about plugins.

Add ejs files in plugin-styles.
It will be loaded once.
__Warning: The style will be loaded REGARDLESS OF PLUGINS WILL BE USED.__
