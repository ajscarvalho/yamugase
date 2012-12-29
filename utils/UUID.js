
Yamugase.UUID = {};
Yamugase.UUID.CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
Yamugase.UUID.generate = function()
{
	var chars = Yamugase.UUID.CHARS,
		uuid = new Array(36),
		rnd = 0,
		r;

	for (var i = 0; i < 36; i++)
	{
		if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
		r = rnd & 0xf;
		rnd = rnd >> 4;
		uuid[i] = chars[r];
	}
	return uuid.join('');
};
