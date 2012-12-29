
array_contract = function (subject, pos)
{
	if (pos < 0) return subject;
	for (var i = pos; i < subject.length; i++)
	{
		subject[i] = subject[i+1];
	}

	subject.pop();
	return subject;
};

/*
array_lookup = function (array, key, value)
{
	for (var i = 0; i < array.length; i++)
		if (array[i][key] == value) return array[i];

	return null;
};

array_keys = function(obj)
{
	var keys = [];
	for(var key in obj) keys.push(key);
	return keys;
};

set_add_element = function(set, element)
{
	if (set.indexOf(element) >= 0) return; // already in set
	set.push(element);
};
*/
