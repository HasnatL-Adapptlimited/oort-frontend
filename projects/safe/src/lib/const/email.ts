/** Editor tinymce configuration. */
export const EDITOR_CONFIG = {
  base_url: '/tinymce',
  suffix: '.min',
  plugins:
    'preview paste importcss searchreplace autolink code visualblocks visualchars fullscreen image link media table charmap hr nonbreaking insertdatetime advlist lists wordcount imagetools textpattern help charmap quickbars emoticons',
  imagetools_cors_hosts: ['picsum.photos'],
  menubar: 'edit view insert format tools table help',
  toolbar:
    'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | charmap emoticons | fullscreen  preview save | insertfile image media link',
  toolbar_sticky: true,
  image_advtab: true,
  importcss_append: true,
  height: 600,
  image_caption: true,
  quickbars_selection_toolbar:
    'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
  toolbar_mode: 'sliding',
  contextmenu: 'link image imagetools table',
  content_style: 'body { font-family: Roboto, "Helvetica Neue", sans-serif; }',
  images_upload_handler(blobInfo: any, success: any, failure: any): any {
   success('data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64());
  }
};
