
Yamugase.XML = {};
Yamugase.XML.HEADER = '<?xml version="1.0" encoding="utf-8"?>';

Yamugase.XML.addTotalEvents = function(count)
{
	return '<TotalEvents>' + l + '</TotalEvents>';
};

Yamugase.XML.addEventListNodes = function(events)
{
	return '<Events>' + events + '</Events>';
};

Yamugase.XML.convertFromJSONList = function(dataList)
{
	var events = '';
	for(var i = 0, l = dataList.length; i < l; i++)
	{ 
		events += Yamugase.XML.convertFromJSON(dataList[i]);
	}
	return Yamugase.XML.HEADER + 
		Yamugase.XML.addEventListNodes(Yamugase.XML.totalEvents(l) + events); 
};

Yamugase.XML.convertFromJSONResponse = function(data)
{
	return Yamugase.XML.HEADER + 
		Yamugase.XML.convertFromJSON(data);
};

Yamugase.XML.convertFromJSON = function(data)
{
console.log(data);
	return Yamugase.XML.convertFromJSO(JSON.parse(data));
};


Yamugase.XML.convertFromJSO = function(data)
{
//	var l = data.length;

//console.log(data);
//	var xml = '<?xml version="1.0" encoding="utf-8"?>\n<Events><TotalEvents>' + l + '</TotalEvents>';
//	for(var i = 0; i < l; i++)
//	{
//		var ev = data[i];
	var xml = '', ev = data;
		xml += "<Event>";
		if (!ev.action) ev.action = 'ignore';
		xml += Yamugase.XML.to_val(ev);
//console.log(ev);
		xml += "</Event>";
	return xml;
//	} 
//	return xml += "</Events>";
};

Yamugase.XML.to_val = function(data)
{
	var xml = '';
	var listNodeName = data.objectClass ? data.objectClass : 'ListItem';

//console.log("   to_xml_val", data);
	if ('object' == typeof(data))
	{
		for (var key in data)
		{
			if (data.hasOwnProperty(key))
			{
				if (isNaN(key))
					xml+= "<" + key + ">" + Yamugase.XML.to_val(data[key]) + "</" + key + ">";
				else
					xml+= "<" + listNodeName + ">" + Yamugase.XML.to_val(data[key]) + "</" + listNodeName + ">";
			}
		}
		return xml;
	}
	else
		return '<![CDATA[' + data + ']]>';
};
