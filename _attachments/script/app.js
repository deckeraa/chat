// Apache 2.0 J Chris Anderson 2011
$(function() {   
    // friendly helper http://tinyurl.com/6aow6yn
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    var path = unescape(document.location.pathname).split('/'),
        design = path[3],
        db = $.couch.db(path[1]);
    function drawItems() {
        db.view(design + "/recent-items", {
            descending : "true",
            limit : 50,
            update_seq : true,
            success : function(data) {
                setupChanges(data.update_seq);
                var them = $.mustache($("#recent-messages").html(), {
                    items : data.rows.map(function(r) {return r.value;})
                });
                $("#content").html(them);
            }
        });
    };
    drawItems();
    var changesRunning = false;
    function setupChanges(since) {
        if (!changesRunning) {
            var changeHandler = db.changes(since);
            changesRunning = true;
            changeHandler.onChange(drawItems);
        }
    }
    $.couchProfile.templates.profileReady = $("#new-message").html();
    $("#account").couchLogin({
        loggedIn : function(r) {
            $("#profile").couchProfile(r, {
                profileReady : function(profile) {
                    $("#create-message").submit(function(e){
                        e.preventDefault();
                        var form = this, doc = $(form).serializeObject();
                        doc.created_at = new Date();
                        doc.profile = profile;

                        var input_db = "chat";//$('.documentForm input#_db').val();
                        var input_id = $(form).find('input#_id').val();
                        var input_rev = $(form).find('#_rev').val();

                        var submit = function (couchDoc) {
                            var id = couchDoc.id || couchDoc._id;
                            var rev = couchDoc.rev || couchDoc._rev;
                            $(form).find('input#_rev').val(rev);
                            $(form).ajaxSubmit({
                                url:  "/chat/woof",
                                success: function(response) {
                                    console.log(response);
                                }});
                        }

                        $.couch.db(input_db).openDoc(input_id, {
                            success: function(couchDoc) {
                                console.log("success");
                                submit(couchDoc);
                            },
                            error: function(status) {
                                console.log("failure");
                                $.couch.db(input_db).saveDoc({"_id":input_id}, {
                                    success: function(couchDoc) {
                                        submit(couchDoc);
                                    }});
                            }});

                        // db.saveDoc(doc, {success : function(data) {

                        //     $(form).find("#attachment").ajaxSubmit({url: "/" + db.name + "/" + data.id, success: function(response) {
                        //         alert("Your attachment was submitted.");
                        //         form.reset();
                        //     }});
                        // }});
                        return false;
                    }).find("input").focus();
                }
            });
        },
        loggedOut : function() {
            $("#profile").html('<p>Please log in to see your profile.</p>');
        }
    });
 });
