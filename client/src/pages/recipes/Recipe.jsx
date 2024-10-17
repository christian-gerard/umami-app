import { useContext, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFormik, FieldArray, Formik, Field, Form } from "formik";
import toast from "react-hot-toast";
import { object, string, array, number } from "yup";
import { date as yupDate } from "yup";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import RecipeForm from "../recipes/RecipeForm";
import Nav from "../../components/Nav";
import { useDropzone} from 'react-dropzone'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Dropzone from 'react-dropzone'


function Recipe({ id, name, steps, ingredients, category, prep_time, source, recipe_img, cookbooks }) {

  const { user, updateRecipes } = useContext(UserContext);

  const route = useParams();
  const nav = useNavigate();
  const {getRootProps, getInputProps} = useDropzone();

  const [editMode, setEditMode] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState({});
  const [files, setFiles] = useState([]);

  const handleEdit = () => {
    setEditMode(!editMode);
  };

  const handleAddIngredient = () => {
    push({ name: "", amount: "", measurement_unit: "" });
  };

  const handleDelete = () => {

    fetch(`/api/v1/recipes/${route.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          const newRecipes = user.recipes.filter(
            (recipe) => recipe.id !== currentRecipe.id,
          );
          updateRecipes(newRecipes);
          nav("/cookbook");
          toast.success("Deleted");
        } else {
          return res.json().then((errorObj) => toast.error(errorObj.message));
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const recipeSchema = object({
    name: string()
    .max(50, 'Name must be 50 characters or less')
    .required('Name is required'),
    instructions: string()
    .max(2000, 'Must be 2000 characters or less'),
    source: string()
    .max(50, 'Source must be 50 characters or less')
    .required('Source is required'),
    category: string()
    .required('Category is required')
    .oneOf(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']),
    prep_time: string()
    .required('Prep Time is required'),
    ingredients: array().of(
      object({
        name: string()
        .max(50, 'Name must be 50 characters or less')
        .required('Name is required'),
        amount: number('Must be a number')
        .required('Amount is required'),
        measurement_unit: string()
        .oneOf(['tsp', 'tbsp', 'cups', 'pt', 'qt', 'gal', 'oz', 'fl oz', 'lb', ''], 'Must match approved units'),
      }),
    ),
  });

  const initialValues = {
    name: "",
    instructions: "",
    category: "",
    prep_time: "",
    source: "",
    ingredients: [
      {
        name: "",
        amount: "",
        measurement_unit: "",
      }
    ],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: recipeSchema,
    onSubmit: (formData) => {

      formData['ingredients'] = JSON.stringify(formData['ingredients'])

      const fd = new FormData()

      fd.set("image_file", files[0])

      for(let key in formData) { fd.set(key, formData[key])}

      fetch(`/recipes/${currentRecipe.id}`, {
        method: "PATCH",
        body: fd,
      }).then((res) => {
        if (res.ok) {
          return res.json().then((data) => {
            console.log(data)
            const updatedRecipes = user.recipes.map((recipe) => recipe.id === currentRecipe.id ? data : recipe)
            updateRecipes(updatedRecipes)
            handleEdit()
            toast.success("Recipe Updated");
          });
        } else {
          return res.json().then((errorObj) => toast.error(errorObj.message));
        }
      });
    },
  });

  useEffect(() => {
    if (route.id) {
      fetch(`/api/v1/recipes/${route.id}`).then((res) => {
        if (res.ok) {
          res
            .json()
            .then((data) => {
              setCurrentRecipe(data);
              formik.setValues({
                name: data.name,
                instructions: data.instructions,
                category: data.category,
                source: data.source,
                prep_time: data.prep_time,
                ingredients: data.ingredients.map((ingredient) => ({
                  name: ingredient.name,
                  amount: ingredient.amount,
                  measurement_unit: ingredient.measurement_unit
                }))
              });
            })
        } else if (res.status === 422) {
          toast.error("Invalid Login");
        } else {
          return res.json().then((errorObj) => toast.error(errorObj.Error));
        }
      });
    }
  }, [route.id, editMode]);

  const removeFile = (name) => {
    setFiles(files => files.filter(file => file.name !== name ))
  }

  return (
    <>

      {route.id ?

        // Recipe Page
        <div className='h-[92%] w-full flex justify-center items-center'>
          <div className='bg-champagne size-[90%] rounded-lg flex flex-col m-6'>
            <div className='h-[10%] flex justify-between'>
              <button
                  className=" border rounded-lg p-2 m-2 text-black w-[75px]"
                  onClick={ () => nav('/cookbook')}
                >
                  <ArrowBackIcon/>
                  Back
              </button>

              <div className='flex flex-row'>

                <button
                  className="bg-shittake rounded-lg p-2 m-2 text-white w-[100px] flex items-center"
                  onClick={handleEdit}
                >
                  <EditIcon className='mr-1'/>
                  EDIT
                </button>
                <button
                  className="bg-white rounded-lg p-2 m-2 text-shittake w-[100px] flex items-center"
                  onClick={handleDelete}
                >
                  <DeleteIcon className='mr-1'/>
                  DELETE
                </button>

              </div>

            </div>

            <div className='h-[90%] flex flex-col justify-between'>

              {/* Recipe Title */}
              <div className='h-[10%] flex items-end'>
                <p className="text-5xl text-black ">{ currentRecipe.name ? currentRecipe.name : ''}</p>
              </div>

              {/* Recipe Body */}

              <div className='h-[90%] flex flex-col sm:flex-row '>

                {/* Recipe Image */}
                <div className='h-[40%] sm:h-full sm:w-[50%] flex justify-center items-center overflow-hidden'>
                  <img alt='recipe_img' src={ currentRecipe.recipe_img ? `data:${currentRecipe.recipe_img.mimetype};base64,${currentRecipe.recipe_img.img}` : '/umami.png' } className='size-[250px] sm:size-[400px] rounded-2xl'/>
                </div>

                {/* Recipe Details */}
                <div className='h-[60%] sm:h-full sm:w-[50%] border border-shittake sm:border-none  overflow-y-scroll scrollbar scrollbar-thumb-shittake '>

                <p className='bg-shittake rounded-xl text-white p-1 mb-4 mt-2'>Ingredients</p>
                  {currentRecipe.ingredients ? (
                    <ul className='px-4 flex gap-4 flex-wrap'>
                      {currentRecipe.ingredients.map((ingredient) => (
                        <li className='bg-gray rounded-xl text-black p-1 flex gap-4'>
                          {ingredient.name} {ingredient.amount}{" "}
                          {ingredient.measurement_unit}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No Ingredients</p>
                  )}
                <p className='bg-shittake rounded-xl text-white p-1 mb-4 mt-2'>Instructions</p>
                <p className="text-lg sm:px-4">{currentRecipe.instructions ? currentRecipe.instructions : "....."}</p>

                <p className='bg-shittake rounded-xl text-white p-1 mb-4 mt-2'>Details</p>
                <div className='px-4 flex gap-4 flex-wrap mb-2'>
                  <p className='bg-gray rounded-xl text-black p-1 '>Prep Time: {currentRecipe.prep_time}</p>
                  <p className='bg-gray rounded-xl text-black p-1 '>Category: {currentRecipe.category}</p>
                  <p className='bg-gray rounded-xl text-black p-1 '>Source: {currentRecipe.source}</p>

                </div>

                </div>

              </div>
















            </div>


          </div>

          {/* Recipe Edit Form */}
          {editMode && (
            <div className="fixed inset-0 flex justify-center items-center transition-colors backdrop-blur">
              <Formik onSubmit={formik.handleSubmit} initialValues={initialValues}>
                <Form className="size-[95%] text-md sm:size-[90%] flex flex-col justify-center items-center">

                  {/* Form Exit */}
                  <div className='h-[4%] w-full flex items-start '>
                    <button className="bg-gray border text-black rounded-xl flex justify-center w-full " type="button" onClick={handleEdit}>
                      <CloseIcon style={{size: '50px'}}/>
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className='h-[92%] w-full bg-white rounded-lg p-2 border border-shittake flex flex-col gap-2 overflow-y-scroll scrollbar scrollbar-thumb-shittake text-base'>

                    {/* Name Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="name">
                        Name
                      </label>


                      <input
                        type="text"
                        name="name"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.name}
                        className="border rounded-md p-1"
                        placeholder="Name your recipe"
                        />

                        {formik.errors.name && formik.touched.name && (
                          <div className="text-shittake flex items-center">❌  {formik.errors.name}</div>
                        )}

                    </div>

                    {/* Category Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="category">
                        Category
                      </label>

                      <select
                      as='select'
                      name="category"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.category}
                      className="border rounded-md p-1"
                      placeholder="Category"
                      >
                        <option value='' className='bold italic'>Select Category</option>
                        <option value='Breakfast'>🥣 Breakfast</option>
                        <option value='Lunch'>🥪 Lunch</option>
                        <option value='Dinner'>🍽️ Dinner</option>
                        <option value='Snack'>🍎 Snack</option>
                        <option value='Dessert'>🍦 Dessert</option>
                      </select>


                      {formik.errors.category && formik.touched.category && (
                        <div className="text-shittake flex items-center">❌  {formik.errors.category}</div>
                      )}

                    </div>

                    {/* Ingredients Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="ingredients">
                        Ingredients
                      </label>

                      <FieldArray name="ingredients" validateOnChange={true}>
                        {(fieldArrayProps) => {
                          const { push, remove, form } = fieldArrayProps;
                          const { values } = form;
                          const ingredients = values.ingredients || [];

                          const handleAddIngredient = () => {
                            push({ name: "", amount: "", measurement_unit: "" });
                          };

                          for (let i = 0; i < currentRecipe.ingredients.length; i++) {
                            handleAddIngredient()
                          }

                          const handleDeleteIngredient = (index) => {

                            if (index !== 0) {

                              remove(index)
                              const updatedIngredients = [...formik.values.ingredients]
                              updatedIngredients.splice(index, 1)
                              formik.setFieldValue('ingredients',updatedIngredients)

                            } else if (index === 0) {
                              formik.setFieldValue('ingredients[0]', { name: "", amount: "", measurement_unit: "" })
                            }

                          }

                          return (
                            <>
                              {ingredients.map((ingredient, index) => (
                                <div key={index} className="flex flex-row w-full gap-1 text-sm sm:text-base">

                                  {/* Ingredient Number */}
                                  <div className='w-[3%] sm:w-[5%] h-full text-black flex justify-center items-start'>
                                    <p className='text-xl flex items-center'>{index >= 0 ? index + 1 : ''}</p>
                                  </div>

                                  {/* Ingredient Name */}
                                  <Field name={`ingredients[${index}].name`}
                                    value={
                                      formik.values.ingredients[index]
                                        ? formik.values.ingredients[index].name
                                        : ""
                                    }
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Name"
                                    className="border rounded-md p-1 w-[50%] sm:w-[50%]"/>


                                  {/* Ingredient Amount */}
                                  <Field name={`ingredients[${index}].amount`}
                                    placeholder="#"
                                    type='number'
                                    value={
                                      formik.values.ingredients[index]
                                        ? formik.values.ingredients[index].amount
                                        : ""
                                    }
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    step='1'
                                    min="1"
                                    max="10000"
                                    className="border rounded-md p-1 w-[10%]"/>

                                  {/* Ingredient Measurement */}
                                  <Field as='select'
                                    name={`ingredients[${index}].measurement_unit`}
                                    placeholder="Unit"
                                    value={
                                      formik.values.ingredients[index]
                                        ? formik.values.ingredients[index].measurement_unit
                                        : ""
                                    }
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    className="border rounded-md p-1 w-[25%] sm:w-[30%]">

                                      <option className='text-gray italic' value=''>Units</option>
                                      <option value='tsp'>Teaspoon</option>
                                      <option value='tbsp'>Tablespoon</option>
                                      <option value='cups'>Cup</option>
                                      <option value='pt'>Pint</option>
                                      <option value='qt'>Quart</option>
                                      <option value='gal'>Gallon</option>
                                      <option value='oz'>Ounce</option>
                                      <option value='fl oz'>Fluid Ounce</option>
                                      <option value='lb'>Pound</option>

                                  </Field>

                                  {/* Add + Delete Buttons */}
                                  <div className={`w-[14%] sm:w-[7%] flex flex-row`}>
                                    {/* Remove Ingredient */}
                                    <button type="button" onClick={() => handleDeleteIngredient(index)} className="text-black rounded-lg">
                                      <RemoveIcon />
                                    </button>

                                    {/* Add Ingredient */}
                                    <button type="button" onClick={handleAddIngredient} className="text-black rounded-lg">
                                      <AddIcon />
                                    </button>
                                  </div>


                                </div>
                              ))}
                            </>
                          );
                        }}
                      </FieldArray>


                      {formik.errors.ingredients && formik.touched.ingredients ? (

                        formik.touched.ingredients.map((ing, index) => {
                          if(Object.values(ing).every(value => value === true) && formik.errors.ingredients[index]) {
                            const errors = formik.errors.ingredients[index]
                            return Object.entries(errors).map(err =>
                              <div className="text-shittake flex gap-1 flex items-end text-base">
                                <p>❌</p>
                                <p className='text-xl'>{index + 1}:</p>
                                <p>{err[1]}</p>
                              </div>
                            )

                          }

                        })

                      )
                      :
                      <></>
                      }



                    </div>

                    {/* Prep Time Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="prep_time">
                        Prep Time
                      </label>

                      <select
                        as='select'
                        name="prep_time"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.prep_time}
                        className="border rounded-md p-1"
                        placeholder="Prep time"
                      >
                        <option value=''>Select Prep Time</option>
                        <option value='>5min'>🏃🏻💨 {'>'}5 min</option>
                        <option value='5-30 min'>⚡️ 5-30 min</option>
                        <option value='30-60 min'>⏲️ 30-60 min</option>
                        <option value='1-3 hr'>👩🏽‍🍳 1-3 hr</option>
                        <option value='All Day'>📆 All Day</option>
                      </select>

                      {formik.errors.prep_time && formik.touched.prep_time && (
                          <div className="text-shittake flex items-center">❌  {formik.errors.prep_time}</div>
                      )}



                    </div>

                    {/* Source Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="source">
                        Source
                      </label>

                      <input
                        type="text"
                        name="source"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.source}
                        className="border rounded-md p-1"
                        placeholder="Enter Source"
                      />
                      {formik.errors.source && formik.touched.source && (
                      <div className="text-shittake flex items-center">❌  {formik.errors.source}</div>
                      )}


                    </div>

                    {/* Img Upload Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="recipe_img">
                        Update Recipe Image
                      </label>

                      <Dropzone onDrop={acceptedFiles => {
                        setFiles(acceptedFiles.map(file => Object.assign(file, {
                          preview: URL.createObjectURL(file)
                        })));}
                      }>
                        {({getRootProps, getInputProps}) => (
                          <section>
                            <div {...getRootProps()}>
                              <input {...getInputProps()} />
                              <p className='bg-shittake border text-white p-2 rounded-lg'>

                                <UploadFileIcon />
                                Drag or Click Here

                              </p>
                            </div>
                          </section>
                        )}
                      </Dropzone>


                      {files[0] ?
                      <div className='flex flex-row justify-between bg-champagne p-2 m-2 rounded-lg '>

                        <div className='flex flex-row'>
                          <img alt='img_preview' src={files[0].preview} className='h-[50px] w-[50px]' />

                          <div className='flex flex-col'>
                            <p>{files[0].name}</p>
                            <p className='flex items-center text-sm'>{Math.round(files[0].size / 1024)} KB</p>


                          </div>

                        </div>


                        <div className='flex flex-col'>

                          <button
                            className='bg-shittake text-white rounded-lg p-1'
                            onClick={() => removeFile(files[0].name)}
                          >
                            Remove
                          </button>

                        </div>

                      </div>
                      :
                      <p className='pl-2'>No Img Uploaded</p>
                      }

                    </div>

                    {/* Instructions Field */}
                    <div className='flex flex-col gap-[4px]'>

                      <label htmlFor="instructions">
                        Instructions
                      </label>
                      <textarea
                        name="instructions"
                        as='textarea'
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.instructions}
                        className="border rounded-md p-1 min-h-[150px]"
                        placeholder="Write instructions here..."
                      />

                      {formik.errors.instructions && formik.touched.instructions && (
                          <div className="text-shittake flex items-center">❌  {formik.errors.instructions}</div>
                      )}

                    </div>

                  </div>

                  {/* Form Submit */}
                  <div className='h-[4%] w-full flex items-end sm:mt-2'>
                    <button type ='submit' className="text-lg bg-champagne border border-black text-black hover:bg-transparent rounded-lg w-full">
                      Update Recipe
                    </button>
                  </div>


                </Form>
              </Formik>
            </div>
          )}

        </div>

        :

        // Recipe Card
        <NavLink to={`/recipes/${id}`} className='sm:w-[350px]'>
          <div className=" border bg-champagne rounded-lg p-2 flex flex-row">
            <div className='w-[60%] text-md overflow-hidden'>
              <p className="text-2xl pb-[0.25px]">{name ? name : ""}</p>
              <p className=''>Category: {category ? category[0].toUpperCase() : ""}{category ? category.substring(1) : "None"}</p>
              <p className=''>Source: {source ? source[0].toUpperCase() : ""}{source ? source.substring(1) : "None"}</p>
              <p className=''>Prep Time: {prep_time ? prep_time[0].toUpperCase() : ""}{prep_time ? prep_time.substring(1) : "None"}</p>
              <p className=''>Ingredients: {ingredients && ingredients.length !== 0 ? ingredients.length : "None"}</p>
            </div>
            <div className='w-[40%] flex justify-center items-center'>
              <img src={ recipe_img ? `data:${recipe_img.mimetype};base64,${recipe_img.img}` : '../public/umami.png' } alt='recipeimagedetails' className='w-[120px] h-[120px] sm:w-[120px] sm:h-[120px] border rounded-2xl'/>
            </div>
          </div>
        </NavLink>

      }

    </>
  )
}

export default Recipe;