from . import ma, fields, validate, validates, Ingredient, datetime

class IngredientSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Ingredient
        load_instance = True
        ordered = True
        partial = ('id',)

    name = fields.String(
        require=True
    )
    amount = fields.Integer()

    measurement_unit = fields.String(
        require=True,
        validate=validate.OneOf(choices=['tsp', 'tbsp', 'cups', 'pt', 'qt', 'gal', 'oz', 'fl oz', 'lb', 'unit'])
    )

    recipe_id = fields.Integer(required=True)

    recipe = fields.Nested('RecipeSchema')

ingredient_schema = IngredientSchema()
ingredients_schema = IngredientSchema(many=True)