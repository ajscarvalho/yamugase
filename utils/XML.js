
XML = {};

XML.convertFromJSO = function(data)
{
	var l = data.length;

//console.log(data);
	var xml = '<?xml version="1.0" encoding="utf-8"?>\n<Events><TotalEvents>' + l + '</TotalEvents>';
	for(var i = 0; i < l; i++)
	{
		var ev = data[i];
		xml += "<Event>";
		if (!ev.action) ev.action = 'ignore';
		xml += to_xml_val(ev);
//console.log(ev);
		xml += "</Event>";
	} 
	return xml += "</Events>";
};

XML.to_val = function(data)
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
					xml+= "<" + key + ">" + to_xml_val(data[key]) + "</" + key + ">";
				else
					xml+= "<" + listNodeName + ">" + to_xml_val(data[key]) + "</" + listNodeName + ">";
			}
		}
		return xml;
	}
	else
		return '<![CDATA[' + data + ']]>';
};
