/**
 * XMLWriter - XML generator for Javascript, based on .NET's XMLTextWriter.
 * Copyright (c) 2008-2014 Ariel Flesler - aflesler [a] gmail [d] com | http://flesler.blogspot.com
 * Licensed under BSD (https://raw2.github.com/flesler/XMLWriter/master/LICENSE)
 * @version 1.0.2
 * @author Ariel Flesler
 * http://flesler.blogspot.com/2008/03/xmlwriter-for-javascript.html
 */
 
function XMLWriter( encoding, version ){
	if( encoding )
		this.encoding = encoding;
	if( version )
		this.version = version;
};
(function(){
	
var proto = XMLWriter.prototype = {
	/* These are the defaults, you don't need to change them on the original code */
	encoding:'UTF-8',// what is the encoding
	version:'1.0', //what xml version to use
	formatting: 'indented', //how to format the output (indented/none)  ?
	indentChar:'\t', //char to use for indent
	indentation: 1, //how many indentChar to add per level
	newLine: '\n', //character to separate nodes when formatting
	/* */
	//start a new document, cleanup if we are reusing
	writeStartDocument:function( standalone ){
		this.close();//cleanup
		this.stack = [ ];
		this.standalone = standalone;
	},
	//get back to the root
	writeEndDocument:function(){
		this.active = this.root;
		this.stack = [ ];
	},
	//set the text of the doctype
	writeDocType:function( dt ){
		this.doctype = dt;
	},
	//start a new node with this name, and an optional namespace
	writeStartElement:function( name, ns ){
		if( ns )//namespace
			name = ns + ':' + name;
		
		var node = { n:name, a:{ }, c: [ ] };//(n)ame, (a)ttributes, (c)hildren
		
		if( this.active ){
			this.active.c.push(node);
			this.stack.push(this.active);
		}else
			this.root = node;
		this.active = node;
	},
	//go up one node, if we are in the root, ignore it
	writeEndElement:function(){
		this.active = this.stack.pop() || this.root;
	},
	//add an attribute to the active node
	writeAttributeString: function( name, value ){
		if (typeof value == 'string' && window.escapeXML) { value = escapeXML(value) }
		if (this.active) { this.active.a[name] = value }
	},
	//add a text node to the active node
	writeString: function( text ){
		if (text == null) { return }
		if (window.escapeXML) { text = escapeXML(text.toString()) }
		if (this.active) { this.active.c.push(text.toString()) }
	},
	//add plain xml content to the active node without any further checks and escaping
	writeXML:function( text ){
		if( this.active )
			this.active.c.push(text);
	},
	//shortcut, open an element, write the text and close
	writeElementString:function( name, text, ns, attributes ){
		this.writeStartElement( name, ns );
		if (attributes)
			this.writeAttributes(attributes)
		this.writeString( text );
		this.writeEndElement();
	},
	//add a text node wrapped with CDATA
	writeCDATA:function( text ){
		// keep nested CDATA
		text = text.replace(/>>]/g, "]]><![CDATA[>");
		this.writeString( '<![CDATA[' + text + ']]>' );
	},
	//add a text node wrapped in a comment
	writeComment:function( text ){
		this.writeString('<!-- ' + text + ' -->');
	},
	writeEmptyElement:function( name, ns, attributes ){
		this.writeStartElement( name, ns );
		if (attributes)
			this.writeAttributes(attributes)
		this.writeEndElement()
	},
	writeElementBlock:function( name, ns, block, attributes ){
		this.writeStartElement( name, ns );
		if (attributes)
			this.writeAttributes(attributes)
		block(this);
		this.writeEndElement()
	},
	writeElements:function( elements ){
		if (!elements)
			return
		if ($.isArray(elements)) {
			for (const item of elements)
				this.writeElementString(item.key, item.value)
			return
		}
		for (const key in elements)
			this.writeElementString(key, elements[key])
	},
	writeAttributes:function( attributes ){
		if (!attributes)
			return
		if ($.isArray(attributes)) {
			for (const item of attributes)
				this.writeAttributeString(item.key, item.value)
			return
		}
		for (const key in attributes)
			this.writeAttributeString(key, attributes[key])
	},
	//generate the xml string, you can skip closing the last nodes
	flush:function(){		
		this.writeEndDocument();//ensure it's closed
		
		var 
			chr = '', num = this.indentation,
			formatting = this.formatting.toLowerCase() == 'indented',
			buffer = ['<?xml version="'+this.version+'" encoding="'+this.encoding+'"'];
			
		if( this.standalone !== undefined )
			buffer[0] += ' standalone="'+!!this.standalone+'"';
		
		buffer[0] += ' ?>';
		
		if( this.doctype && this.root )
			buffer.push('<!DOCTYPE '+ this.root.n + ' ' + this.doctype+'>'); 
		
		if( formatting ){
			while( num-- )
				chr += this.indentChar;
		}
		
		if( this.root )//skip if no element was added
			format( this.root, '', chr, buffer );
		
		return buffer.join( formatting ? this.newLine : '' );
	},
	//cleanup, don't use again without calling startDocument
	close:function(){
		if( this.root )
			clean( this.root );
		this.active = this.root = this.stack = null;
	},
	getDocument: window.ActiveXObject 
		? function(){ //MSIE
			var doc = new ActiveXObject('Microsoft.XMLDOM');
			doc.async = false;
			doc.loadXML(this.flush());
			return doc;
		}
		: function(){//W3C
			return (new DOMParser()).parseFromString(this.flush(),'text/xml');
	}
};

//utility, you don't need it
function clean( node ){
	var l = node.c.length;
	while( l-- ){
		if( typeof node.c[l] == 'object' )
			clean( node.c[l] );
	}
	node.n = node.a = node.c = null;	
};

//utility, you don't need it
function format( node, indent, chr, buffer ){
	var 
		xml = indent + '<' + node.n,
		nc = node.c.length,
		attr, child, i = 0;
		
	for( attr in node.a )
		xml += ' ' + attr + '="' + node.a[attr] + '"';
	
	xml += nc ? '>' : ' />';

	buffer.push( xml );
		
	if( nc ){
		do{
			child = node.c[i++];
			if( typeof child == 'string' ){
				if( nc == 1 )//single text node
					return buffer.push( buffer.pop() + child + '</'+node.n+'>' );					
				else //regular text node
					buffer.push( indent+chr+child );
			}else if( typeof child == 'object' ) //element node
				format(child, indent+chr, chr, buffer);
		}while( i < nc );
		buffer.push( indent + '</'+node.n+'>' );
	}
};

//add chaining! :)
for( var method in proto ){
	if( typeof proto[method] == 'function' && !/flush|getDocument/.test(method) ){
		var original = proto[method];
		proto[method] = function(){
			arguments.callee._o_.apply(this,arguments);
			return this;
		};
		proto[method]._o_ = original;
	}
}

})();
