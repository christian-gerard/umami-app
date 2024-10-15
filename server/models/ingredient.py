from . import SerializerMixin, validates, re, db
from sqlalchemy.ext.hybrid import hybrid_property
from config import flask_bcrypt
from datetime import datetime
import re


class Ingredient(db.Model, SerializerMixin):
    # # # # # Table Name
    __tablename__ = 'ingredients'
    __table_args__ = (db.UniqueConstraint('food_id', 'recipe_id', name='ingredient_recipe_uc'),)
    # # # # # Attribute
    id = db.Column(db.Integer, primary_key = True)
    amount = db.Column(db.Integer, nullable=False)
    measurement_unit = db.Column(db.String)
    food_id = db.Column(db.Integer, db.ForeignKey('foods.id'))
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'))

    # # # # # Relationship
    food = db.relationship('Food', back_populates='ingredients')
    recipe = db.relationship('Recipe', back_populates='ingredients')

    # # # # # Serialize
    serialize_rules=('-food','-recipe')
    
    # # # # # Representation
    def __repr__(self):
        return f""" 
            <Ingredient {self.id}
                />
        """

    # # # # # Validate
    @validates('amount')
    def validate_amount(self, key, amount):
        assert amount > 0, "Amount must not be zero"
        assert amount, "Amount must be provided"
        return amount
    
    @validates('measurement_unit')
    def validate_measurement(self, key, measurement_unit):
        units = ('cups', 'fl oz', 'liters', 'pint', 'quart', 'oz', 'lbs', 'tbsp', 'tsp', 'serving')
        assert measurement_unit in units, "Must match approved units"
        return measurement_unit