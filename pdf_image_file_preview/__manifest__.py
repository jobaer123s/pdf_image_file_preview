{
    "name": "PDF/Image File Preview",
    "summary": "Adds a preview button to Binary fields for PDF, text, and images.",
    "version": "18.0.1.0.0",
    "category": "Tools",
    "author": "Sapnil Sarker Bipro",
    "license": "LGPL-3",
    "depends": ["web", "sale"],
    "data": [
        "views/sale_order_views.xml",
    ],
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
