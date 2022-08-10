import replaceURL from "./replace_url";

let contextURL = "https://www.a.com/aaaaa/doc";
test('common replace', () => {
    let fullURL = "https://www.a.com/aaaaa/doc/path/to/p.html";
    expect(replaceURL(fullURL, contextURL)).toBe("path-to-p.html");
});
test('add .html 1', () => {
    let fullURL = "https://www.a.com/aaaaa/doc/path/to/p";
    expect(replaceURL(fullURL, contextURL)).toBe("path-to-p.html");
});
test('add .html 2', () => {
    let fullURL = "https://www.a.com/aaaaa/doc/path/to/p/";
    expect(replaceURL(fullURL, contextURL)).toBe("path-to-p.html");
});
test('other url1', () => {
    let fullURL = "https://www.bbbb.com/aaaaa/doc/path/to/p";
    expect(replaceURL(fullURL, contextURL)).toBe(fullURL);
});
test('other url2', () => {
    let fullURL = "https://www.a.com/aaaaa/xxxxxx/path/to/p";
    expect(replaceURL(fullURL, contextURL)).toBe(fullURL);
});
test('other url3', () => {
    let fullURL = "https://www.a.com/aaaaa/docaaaa";
    expect(replaceURL(fullURL, contextURL)).toBe(fullURL);
});
test('hash', () => {
    let fullURL = "https://www.a.com/aaaaa/doc/path/to/p.html#opt1";
    expect(replaceURL(fullURL, contextURL)).toBe("path-to-p.html#opt1");
});
test('root', () => {
    let fullURL = contextURL;
    expect(replaceURL(fullURL, contextURL)).toBe("_index.html");
});
test('root with hash', () => {
    let fullURL = contextURL + "#opt2";
    expect(replaceURL(fullURL, contextURL)).toBe("_index.html#opt2");
});
test('encodeURI', () => {
    let fullURL = "https://www.a.com/aaaaa/doc/category-%E7%AE%80%E4%BB%8B.html";
    expect(replaceURL(fullURL, contextURL)).toBe("category-E7AE80E4BB8B.html");
});
test('replace with .html', () => {
    let fullURL = "https://www.a.com/aaaaa/doc/path/to/p.php#m3";
    expect(replaceURL(fullURL, contextURL)).toBe("path-to-p.html#m3");
});
