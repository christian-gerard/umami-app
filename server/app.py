from flask import request, session, g
from time import time
from flask_restful import Resource
from config import app, db, api
from werkzeug.exceptions import NotFound
from functools import wraps
from models.user import User
from models.recipe import Recipe
from models.ingredient import Ingredient
from models.recipe_img import RecipeImg
from schemas.recipe_schema import recipe_schema, recipes_schema
from schemas.ingredient_schema import ingredient_schema, ingredients_schema
from schemas.recipe_img_schema import recipe_img_schema, recipes_img_schema
from schemas.user_schema import user_schema, users_schema
import json
import ipdb

# # # General Route
# # Error Handling
@app.errorhandler(NotFound)
def not_found(error):
    return {"error": error.description}, 404

# # Route Protection
def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return {"message": "Access Denied, please log in!"}, 422
        return func(*args, **kwargs)
    return decorated_function



# # # REST API

# # # # # Users
class Users(Resource):
    @login_required
    def get(self):
        try:
            users = users_schema.dump(User.query)
            return users, 200
        except Exception as e:
            return {"Error": str(e)}, 400

api.add_resource(Users, '/users')

class UserById(Resource):
    @login_required
    def get(self,id):
        try:
            user = user_schema.dump(User.query.get(id))
            if user:
                return user, 200
            else:
                return {"Error": "User not found"}, 404
        except Exception as e:
            return {"Error": str(e)}, 400
    @login_required
    def patch(self,id):
        try:
            og = User.query.filter(User.id == id).first()
            if og:
                data = request.get_json()
                updated_entry = user_schema.load(data, instance=og, partial=True)
                db.session.commit()
                return user_schema.dump(updated_entry), 200
            else:
                return {"Error": f"Unable to find user with id {id}"}, 404
        except Exception as e:
            return {"Error": str(e)}, 400

    @login_required
    def delete(self, id):
        try:
            user = db.session.get(User,id)
            if user:
                db.session.delete(user)
                db.session.commit()
                return {}, 204
            else:
                return {"Error": "User not found"}, 404
        except Exception as e:
            return {"Error": str(e)}, 400

api.add_resource(UserById, '/users/<int:id>')





# # # # # Recipes
class Recipes(Resource):

    def get(self):
        try:
            recipes = recipes_schema.dump(Recipe.query)
            return recipes, 200
        except Exception as e:
            return {"Error": str(e)}, 400

    @login_required
    def post(self):
        try:

            data = request.form
            files = request.files
            recipe = recipe_schema.load({
                "name" : data.get("name"),
                "steps" : data.get("steps"),
                "category": data.get("category"),
                "source": data.get("source"),
                "prep_time": data.get("prep_time"),
                "user_id" : session.get("user_id")
            })

            db.session.add(recipe)
            db.session.commit()

            ingredients = data.get('ingredients')
            for ingredient in json.loads(ingredients):
                new_ingredient = {
                    "name": ingredient.get('name'),
                    "measurement_unit": ingredient.get('measurement_unit'),
                    "amount": ingredient.get('amount'),
                    "recipe_id": recipe.id
                }
                ingredient_obj = ingredient_schema.load(new_ingredient)
                db.session.add(ingredient_obj)
            db.session.commit()

            recipe_img = files['image_file']
            new_recipe_img = {
                "name": recipe_img.name,
                "mimetype": recipe_img.headers[1][1],
                "recipe_id":recipe.id,
                "img": recipe_img.read()
            }
            db.session.add(recipe_img_schema.load(new_recipe_img))
            db.session.commit()
            return recipe_schema.dump(recipe), 201

        except Exception as e:
            db.session.rollback()
            return {"Error": str(e)}, 400


api.add_resource(Recipes, '/recipes')

class RecipeById(Resource):
    def get(self,id):
        try:
            recipe = recipe_schema.dump(Recipe.query.get(id))
            if recipe:
                return recipe, 200
            else:
                return {"Error": "Recipe not found"}, 404
        except Exception as e:
            return {"Error": str(e)}, 400


    @login_required
    def patch(self,id):
        try:
            # INIT DATA
            data = request.form
            img = request.files
            ingredients = data.get('ingredients')
            recipe = Recipe.query.filter(Recipe.id == id).first()
            current_recipe_image = RecipeImg.query.filter_by(recipe_id=recipe.id).first()

            # PATCH RECIPE
            new_recipe = {
                "name" : data.get("name"),
                "steps" : data.get("steps"),
                "category": data.get("category"),
                "source": data.get("source"),
                "prep_time": data.get("prep_time"),
                "user_id" : session.get("user_id")
            }
            if recipe:
                updated_recipe = recipe_schema.load(new_recipe, instance=recipe, partial=True)
                db.session.add(updated_recipe)
                db.session.commit()
            else:
                return {"ERROR": str(e)}, 400



            #PATCH INGREDIENTS
            # Init all existing ingredients
            current_ingredients = Ingredient.query.filter_by(recipe_id=recipe.id).all()
            # delete old ingredients

            for i in current_ingredients:
                db.session.delete(i)

            db.session.commit()


            for ingredient in json.loads(ingredients):
                if (food_obj := Food.query.filter_by(name=ingredient['name']).first()):


                    # does the ingredient exist

                        # INSTANTIATE INGEDIENT OBJECT
                        new_ingredient = {
                            "measurement_unit": ingredient['measurement_unit'],
                            "recipe_id": recipe.id,
                            "food_id": food_obj.id,
                            "amount": ingredient['amount']
                        }

                        updated_ingredient = ingredient_schema.load(new_ingredient)
                        db.session.add(updated_ingredient)

                else:
                    return {"Error": f"{ingredient['name']} is not a valid ingredient"}




                if current_recipe_image:
                    db.session.delete(current_recipe_image)

                if len(img) > 0:
                    file = img['image_file']

                    new_recipe_img = {
                        "name": file.name,
                        "mimetype": file.headers[1][1],
                        "recipe_id":recipe.id,
                        "img": file.read()
                    }

                    db.session.add(recipe_img_schema.load(new_recipe_img))


            db.session.commit()

            return recipe_schema.dump(updated_recipe), 200

        except Exception as e:
            return {"Error": str(e)}, 400

    @login_required
    def delete(self, id):
        try:
            recipe = Recipe.query.get(id)
            if recipe:
                db.session.delete(recipe)
                db.session.commit()
                return {}, 204
            else:
                return {"Error": "Recipe not found"}, 404
        except Exception as e:
            return {"Error": str(e)}, 400

api.add_resource(RecipeById, '/recipes/<int:id>')


# # # # # Auth Flow
class Signup(Resource):
    def post(self):
        try:
            # Pass partial on load() method to avoid id requirement
            data = request.get_json()
            new_user = user_schema.load({
                "username": data.get('username'),
                "password_hash": data.get("password_hash"),
                "email": data.get("email"),
                "role": data.get("role")
            })
            db.session.add(new_user)
            db.session.commit()
            session['user_id'] = new_user.id
            session['username'] = new_user.username
            return user_schema.dump(new_user), 201
        except Exception as e:
            return {"Error": str(e)}, 400

api.add_resource(Signup, '/signup')


class Login(Resource):
    def post(self):
        try:

            data = request.get_json()
            user = User.query.filter_by(username=data.get('username')).first()
            if user and user.authenticate(data.get('password_hash')):
                session["user_id"] = user.id
                session["username"] = user.username
                return user_schema.dump(user), 200
            else:
                return {"Message": "Invalid Login"}, 422
        except Exception as e:
            return {"Error": str(e)}, 400

api.add_resource(Login, '/login')

class Logout(Resource):
    def delete(self):
        try:
            if "user_id" in session:
                del session['user_id']
                del session['username'] #! delete the entire key-value pair
                return {}, 204
            else:
                return {"Error": "A User is not logged in"}, 404

        except Exception as e:
            return {"Error": str(e)}, 400

api.add_resource(Logout, '/logout')

class CheckMe(Resource):
    def get(self):
        if "user_id" in session:
            user = db.session.get(User, session.get("user_id"))
            return user_schema.dump(user), 200
        else:
            return {"message": "Please log in"}, 400

api.add_resource(CheckMe, '/me')


# # # # # Run App
if __name__ == "__main__":
    app.run(port=5555, debug=True)
