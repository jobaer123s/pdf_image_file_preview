{
    "name": "PDF/Image File Preview",
    "summary": "Adds a preview button to Binary fields for PDF, text, and images.",
    "version": "18.0.1.0.0",
    "category": "Tools",
    "author": "Jobaer Hossain - JH Odoo Solution",
    "license": "LGPL-3",
    "depends": ["web", "sale"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "pdf_image_file_preview/static/src/js/binary_preview_patch.js",
            "pdf_image_file_preview/static/src/xml/binary_preview_patch.xml",
        ],
        "web.assets_backend_lazy": [
            "pdf_image_file_preview/static/src/js/binary_preview_patch.js",
            "pdf_image_file_preview/static/src/xml/binary_preview_patch.xml",
        ],
    },
    'images': ['static/description/banner.png'],
    "installable": True,
    "application": True,
    "auto_install": False,
}
