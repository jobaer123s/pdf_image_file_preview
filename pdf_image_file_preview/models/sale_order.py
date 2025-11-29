"""Extend sale orders with a binary field to exercise the preview feature."""

from odoo import fields, models


class SaleOrder(models.Model):
    """Add a binary field that can be used to preview image/PDF uploads."""

    _inherit = "sale.order"

    preview_test_file = fields.Binary(
        string="Preview Test File",
        attachment=True,
        help="Upload any PDF or image here to test the preview button behavior.",
    )

    binary_preview_file = fields.Binary(
        string="Preview Test File",
        attachment=True,
        help="Upload any PDF or image here to test the preview button behavior.",
    )

    binary_preview_filename = fields.Char(
        string="Preview Test File",
        attachment=True,
        help="Upload any PDF or image here to test the preview button behavior.",
    )
