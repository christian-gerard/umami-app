from . import ma, fields, validate, validates, RecipeImg, datetime, ingredient_schema
import base64
from marshmallow import post_load, post_dump

class RecipeImgSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = RecipeImg
        load_instance = True
        ordered = True
        partial = ()

    name = fields.String()
    img = fields.Raw(
        required=True
        )
    mimetype = fields.String()
    recipe_id = fields.Integer()

    @post_dump
    def encode_img(self, data, **kwargs):
        """Convert binary data to a base64-encoded string."""
        if "img" in data and isinstance(data["img"], bytes):
            data["img"] = base64.b64encode(data["img"]).decode("utf-8")
        return data

    @post_load
    def decode_img(self, data, **kwargs):
        """Convert base64-encoded string back to binary data."""
        if "img" in data and isinstance(data["img"], str):
            data["img"] = base64.b64decode(data["img"])
        return data



recipe_img_schema = RecipeImgSchema()
recipes_img_schema = RecipeImgSchema(many=True)