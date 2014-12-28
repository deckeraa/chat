function(doc) {
  if (doc.created_at) {
      var p = doc.profile || {};
      var atts = Object.keys(doc._attachments);
      var att = null;
      if( atts ) {
          att = atts[0];
      }
      emit(doc.created_at, {
          id:doc._id,
          message:doc.message,
          gravatar_url : p.gravatar_url,
          nickname : p.nickname,
          name : doc.name,
          attachment : att
      });
  }
};
