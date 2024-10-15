from . import ma, fields, validate, validates, Cookbook, datetime

class CookbookSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Cookbook
        load_instance = True
        ordered = True
        partial = ('id',)

    name = fields.String(
        required = True,
        validate=validate.Length(
            max=20,
            error="Name must not be more than 20 characters")
        )
    
    user_id = fields.Integer(required=True)
    recipe_id = fields.Integer(required=True)
    created_at = fields.DateTime()

    recipe = fields.Nested('RecipeSchema')
    user = fields.Nested('UserSchema')


cookbook_schema = CookbookSchema()
cookbooks_schema = CookbookSchema(many=True)