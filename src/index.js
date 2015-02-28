"use strict";

var 

    fs = require('fs'),

    registration = function(mimosaConfig, register) {
        register(['postBuild'], 'complete', build_linklist);
    },

    build_linklist = function (config, options, next) {
    
        var linklist_filename = "index.html",

            excludes = [
                /includes\.html/,
                /tpl_base\.html/,
                /tpl_public\.html/,
                /tpl_protected\.html/
            ],

            // mimosa renders html in here
            compiled_dir = fs.readdirSync(config.watch.compiledDir),
            
            // wrap some content in one or multiple (nested) html tags
            html_wrap = function (tags_array, content) {
                return (function fn (tag) {
                    return "<" + tag + ">" + (tags_array.length ? fn(tags_array.shift()) : content) + "</" + tag + ">";
                }(tags_array.shift()));
            },

            // get all ".html" files in the source dir
            html_files = 
                compiled_dir
                    .filter(function (file, index, array) {
                        return (/\.html$/).test(file) && file !== linklist_filename;
                    })
                    .filter(function (file, index, array) {
                        return excludes.every(function (regex) {
                            return !(regex).test(file);
                        });
                    }),

            // create html output
            links_html = 
                (function () {
                    return html_wrap(
                        ["html", "body","div", "ul"], 
                        html_files
                            .map(function (file) {
                                return html_wrap(["li"], ("<a href='" + file + "'>" + file + "</a>"));
                            })
                            .reduce(function (a, b) {
                                return a + b;
                            })
                    );
                }());

        // write output
        fs.writeFileSync(config.watch.compiledDir + "/" + linklist_filename, links_html);

    };

module.exports = {
    registration: registration
};
