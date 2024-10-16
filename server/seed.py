import random
from faker import Faker
from config import app
from models.__init__ import db
from models.user import User
from models.recipe import Recipe
from models.cookbook import Cookbook
from models.ingredient import Ingredient
from models.food import Food

import sys
import random
from rich import print
import ipdb

fake = Faker()

with app.app_context():
    # # # # # BEGIN SEED
    print('\n[purple]------------- BEGIN ------------[/purple]')
    print('\n')

    # # # # # Clean Database
    # print('[purple]Cleaning Database 🧽 [/purple]...\n')
    try:
        User.query.delete()
        Cookbook.query.delete()
        Recipe.query.delete()
        Ingredient.query.delete()
        Food.query.delete()
        db.session.commit()
        print('\t[green]Cleaning Complete[/green] ✅\n')
    except Exception as e:
        db.session.rollback()
        print(f'\t[red]Cleaning Failed[/red] {str(e)} 😞\n')
        sys.exit(1)

    # # # # # Generate Users
    print('[purple]Generating Users 🗣  [/purple]...\n')
    try:
        users = []
        test_user = User(
                username='test',
                email='test@gmail.com',
                role=1
                )
        test_user.password_hash = 'Password1!'
        users.append(test_user)

        for _ in range(10):
            user = User(
                username=fake.first_name(),
                email=fake.email(),
                role=1
                )
            user.password_hash = 'Password1!'
            users.append(user)
        db.session.add_all(users)
        db.session.commit()
        print('\t[green]Users Complete[/green] ✅\n')
    except Exception as e:
        db.session.rollback()
        print('\t[red]User Generation Failed[/red] 😞\n' + str(e))
        sys.exit(1)


    # # # # # Generate Food
    print('[purple]Generating Food 🍱[/purple]  ...\n')
    try:
        print('\t[green]Food Data Not Seeded[/green] ✅\n')
    except Exception as e:
        db.session.rollback()
        print('\t[red]Food Generation Failed[/red] 😞\n' + str(e))
        sys.exit(1)


    # # # # # Generate Recipes
    print('[purple]Generating Recipes 📖[/purple]  ...\n')
    try:
        recipes = []
        for _ in range(10):
            recipe = Recipe(name=fake.word(), steps='StepsTestFORTENCHAR', user_id=random.randint(1,3) )
            recipes.append(recipe)
        db.session.add_all(recipes)
        db.session.commit()
        print('\t[green]Recipes Complete[/green] ✅\n')
    except Exception as e:
        db.session.rollback()
        print('\t[red]Recipe Generation Failed[/red] 😞\n' + str(e))
        sys.exit(1)

    # # # # # Generate Cookbooks
    print('[purple]Generating Cookbooks 📚[/purple]  ...\n')
    try:
        cookbooks = []
        for _ in range(5):
            cookbook = Cookbook(name=fake.word(), user_id=random.randint(1,3), recipe_id=random.randint(1,5) )
            cookbooks.append(cookbook)
        db.session.add_all(cookbooks)
        db.session.commit()
        print('\t[green]Cookbooks Complete[/green] ✅\n')
    except Exception as e:
        db.session.rollback()
        print('\t[red]Cookbooks Generation Failed[/red] 😞\n' + str(e))
        sys.exit(1)

    # # # # # Generate Ingredients
    print('[purple]Generating Ingredients 🥕[/purple]  ...\n')
    try:
        ingredients = []
        for _ in range(3):
            ingredient = Ingredient(amount=10, measurement_unit='cups', food_id=random.randint(1,3), recipe_id=random.randint(1,2) )
            ingredients.append(ingredient)
        db.session.add_all(ingredients)
        db.session.commit()
        print('\t[green]Ingredients Complete[/green] ✅\n')
    except Exception as e:
        db.session.rollback()
        print('\t[red]Ingredients Generation Failed[/red] 😞\n' + str(e))
        sys.exit(1)