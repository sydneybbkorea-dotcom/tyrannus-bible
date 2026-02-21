// uri.js — Universal Resource Identifier system
// Every linkable content has a unique URI: tyrannus://type/segments...

var TyrannusURI = (function(){
  var SCHEME = 'tyrannus';

  // Parse: 'tyrannus://verse/창세기/1/1' → { scheme, type, segments, fragment }
  function parse(uri){
    if(!uri || typeof uri !== 'string') return null;
    var m = uri.match(/^tyrannus:\/\/([^\/]+)\/?(.*?)(?:#(.+))?$/);
    if(!m) return null;
    var segs = m[2] ? m[2].split('/').map(decodeURIComponent) : [];
    return {
      scheme: SCHEME,
      type: m[1],
      segments: segs,
      fragment: m[3] || null
    };
  }

  // Build: ('verse', '창세기', '1', '1') → 'tyrannus://verse/창세기/1/1'
  function build(type /*, ...segments */){
    var segs = [];
    for(var i = 1; i < arguments.length; i++){
      if(arguments[i] != null) segs.push(encodeURIComponent(String(arguments[i])));
    }
    return SCHEME + '://' + type + (segs.length ? '/' + segs.join('/') : '');
  }

  // Convert legacy verse key '창세기_1_1' → 'tyrannus://verse/창세기/1/1'
  function fromLegacyVerseKey(key){
    if(!key) return null;
    var parts = key.split('_');
    if(parts.length < 2) return null;
    return build.apply(null, ['verse'].concat(parts));
  }

  // Convert URI → legacy verse key: 'tyrannus://verse/창세기/1/1' → '창세기_1_1'
  function toLegacyVerseKey(uri){
    var p = parse(uri);
    if(!p || p.type !== 'verse') return null;
    return p.segments.join('_');
  }

  // Build specific URI types
  function verse(book, ch, v){
    return v ? build('verse', book, ch, v) : build('verse', book, ch);
  }

  function note(noteId){
    return build('note', noteId);
  }

  function pdf(pdfId, page){
    return page != null ? build('pdf', pdfId, 'page', page) : build('pdf', pdfId);
  }

  function pdfAnnot(pdfId, annotId){
    return build('pdf', pdfId, 'annot', annotId);
  }

  function strong(code){
    return build('strong', code);
  }

  function commentary(book, ch, v){
    return build('commentary', book, ch, v);
  }

  function tag(tagName){
    return build('tag', tagName);
  }

  function dict(dictType, word){
    return build('dict', dictType, word);
  }

  return {
    parse: parse,
    build: build,
    fromLegacyVerseKey: fromLegacyVerseKey,
    toLegacyVerseKey: toLegacyVerseKey,
    verse: verse,
    note: note,
    pdf: pdf,
    pdfAnnot: pdfAnnot,
    strong: strong,
    commentary: commentary,
    tag: tag,
    dict: dict
  };
})();
