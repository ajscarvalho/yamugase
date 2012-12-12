
mergeObjects = function (target, source)
{
	for (var prop in source) target[prop] = source[prop];
/*
	for (var prop in source) 
	{
		if (source.hasOwnProperty(prop)) 
		{
			target[prop] = source[prop];
		}
	}
*/
};

object_extend = function(objClass, parentClass)
{
	var parentPrototype = parentClass.prototype;
	var objPrototype = objClass.prototype;
	var extName = object_extension_name(parentClass);
	objPrototype[extName] = {};
	var objExtension = objPrototype[extName];

	for (var property in parentPrototype)
		if (parentPrototype.hasOwnProperty(property))
		{
			objPrototype[property] = objExtension[property] = parentPrototype[property]; // copy parent prototype to child prototype and extension (double inheritance)
			if ('function' == typeof(parentPrototype[property]))
				objPrototype['parent_' + property] = parentPrototype[property];
/*
			if ('function' == typeof(parentPrototype[property]))
				objPrototype[property] = (
					function(name, fn)
					{
						return function() {
							var tmp = this.parent;
							this.parent = this.parent[property];
console.log('applying to ', this.className);
							var ret = fn.apply(this, arguments);        
							this.parent = tmp;
							return ret;
						};
					}
				)(property, parentPrototype[property]);
//*/
		}

//	objClass.prototype.parent = objExtension;
};

object_extension_name = function(parentClass)
{
	if (parentClass.prototype.className) return '_' + parentClass.prototype.className + '_prototype';
	throw new Exception('To extend a class, that class must have the className property set to a non-null value');
};

object_count = function(obj)
{
	//return keys(obj).length;
	var count = 0;
	for (var k in obj) if (obj.hasOwnProperty(k)) count++;
	return count;
};

object_debug = function(obj, level, module, maxlevel)
{
	spaces = '';

	if (level) for (i = 0; i < level; i++) spaces = spaces + '  ';
	debug(spaces + obj, module);

	level = level ? level+1 : 1;
	for (i = 0; i < level; i++) spaces = spaces + '  ';

	if (null !== obj && 'object' == typeof(obj))
		for (k in obj) 
			if (obj.hasOwnProperty(k))
				if (null !== obj[k] && 'object' == typeof(obj[k])) 
				{
					debug(spaces + k + ": ", module);
					if (!maxlevel || level < maxlevel)
						object_debug(obj[k], level, module);
				}
				else
					debug(spaces + k + ": " + obj[k], module);

};
