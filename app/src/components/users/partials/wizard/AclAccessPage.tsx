import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { connect } from "react-redux";
import { Field, FieldArray } from "formik";
import Notifications from "../../../shared/Notifications";
import RenderMultiField from "../../../shared/wizard/RenderMultiField";
import {
	checkAcls,
	fetchAclActions,
	fetchAclTemplateById,
	fetchAclTemplates,
	fetchRolesWithTarget,
} from "../../../../thunks/aclThunks";
import { getUserInformation } from "../../../../selectors/userInfoSelectors";
import { hasAccess } from "../../../../utils/utils";
import DropDown from "../../../shared/DropDown";
import { filterRoles, getAclTemplateText } from "../../../../utils/aclUtils";

/**
 * This component renders the access policy page in the new ACL wizard and in the ACL details modal
 */
const AclAccessPage : React.FC<{
  previousPage: any,
	nextPage: any,
	formik: any,
	isEdit?: any,
	user: any,
	checkAcls: any,
}> = ({
	previousPage,
	nextPage,
	formik,
	isEdit,
	user,
	checkAcls,
}) => {
	const { t } = useTranslation();

	const [aclTemplates, setAclTemplates] = useState([]);
	const [aclActions, setAclActions] = useState([]);
	const [roles, setRoles] = useState([]);
	const [loading, setLoading] = useState(false);

	const isAccess =
		hasAccess("ROLE_UI_SERIES_DETAILS_ACL_EDIT", user) || !isEdit;

	useEffect(() => {
		// fetch data about roles, acl templates and actions from backend
		async function fetchData() {
			setLoading(true);
			const responseTemplates = await fetchAclTemplates();
// @ts-expect-error TS(2345): Argument of type '{ id: string; value: any; }[]' i... Remove this comment to see the full error message
			setAclTemplates(responseTemplates);
			const responseActions = await fetchAclActions();
// @ts-expect-error TS(2345): Argument of type '{ id: string; value: any; }[]' i... Remove this comment to see the full error message
			setAclActions(responseActions);
			const responseRoles = await fetchRolesWithTarget("ACL");
			setRoles(responseRoles);
			setLoading(false);
		}

		fetchData();
	}, []);

// @ts-expect-error TS(7006): Parameter 'value' implicitly has an 'any' type.
	const handleTemplateChange = async (value) => {
		// fetch information about chosen template from backend
		const template = await fetchAclTemplateById(value);

		formik.setFieldValue("acls", template);
		formik.setFieldValue("aclTemplate", value);
		await checkAcls(formik.values.acls);
	};

	return (
		<>
			<div className="modal-content">
				<div className="modal-body">
					<div className="full-col">
						<Notifications context="not_corner" />
						{!loading && (
							<ul>
								<li>
									<div className="obj list-obj">
										<header className="no-expand">
											{t("USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.TITLE")}
										</header>
										<div className="obj-container">
											{/* Template selection */}
											<div className="obj tbl-list">
												{isAccess && (
													<table className="main-tbl">
														<thead>
															<tr>
																<th>
																	{t("USERS.ACLS.NEW.ACCESS.TEMPLATES.TITLE")}
																</th>
															</tr>
														</thead>
														<tbody>
															<tr>
																{aclTemplates.length > 0 ? (
																	<td className="editable">
																		<div className="obj-container padded">
																			<p>
																				{t(
																					"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.DESCRIPTION"
																				)}
																			</p>

																			{/* dropdown for selecting a policy template */}
																			<DropDown
																				value={formik.values.aclTemplate}
																				text={getAclTemplateText(
																					aclTemplates,
																					formik.values.aclTemplate
																				)}
																				options={
																					!!aclTemplates ? aclTemplates : []
																				}
																				type={"aclTemplate"}
																				required={true}
// @ts-expect-error TS(7006): Parameter 'element' implicitly has an 'any' type.
																				handleChange={(element) =>
																					handleTemplateChange(element.value)
																				}
																				placeholder={t(
																					"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.LABEL"
																				)}
																				tabIndex={"1"}
																				autoFocus={true}
																			/>
																		</div>
																	</td>
																) : (
																	// Show if no option is available
																	<td>
																		<div className="obj-container padded">
																			<p>
																				{t(
																					"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.DESCRIPTION"
																				)}
																			</p>
																			{t(
																				"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.EMPTY"
																			)}
																		</div>
																	</td>
																)}
															</tr>
														</tbody>
													</table>
												)}
											</div>

											<div className="obj-container">
												<div className="obj tbl-list">
													<header>{t("")}</header>
													<div className="obj-container">
														<table className="main-tbl">
															<thead>
																<tr>
																	<th>
																		{t(
																			"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.ROLE"
																		)}
																	</th>
																	<th className="fit">
																		{t(
																			"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.READ"
																		)}
																	</th>
																	<th className="fit">
																		{t(
																			"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.WRITE"
																		)}
																	</th>
																	{aclActions.length > 0 && (
																		<th className="fit">
																			{t(
																				"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.ADDITIONAL_ACTIONS"
																			)}
																		</th>
																	)}
																	<th className="fit">
																		{t(
																			"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.ACTION"
																		)}
																	</th>
																</tr>
															</thead>
															<tbody>
																<FieldArray name="acls">
																	{({ insert, remove, push }) => (
																		<>
																			{roles.length > 0 ? (
																				formik.values.acls.length > 0 &&
// @ts-expect-error TS(7006): Parameter 'acl' implicitly has an 'any' type.
																				formik.values.acls.map((acl, index) => (
																					<tr key={index}>
																						<td className="editable">
																							<DropDown
																								value={acl.role}
																								text={acl.role}
																								options={
																									!!roles && roles.length > 0
																										? filterRoles(
																												roles,
																												formik.values.acls
																										  )
																										: []
																								}
																								type={"aclRole"}
																								required={true}
// @ts-expect-error TS(7006): Parameter 'element' implicitly has an 'any' type.
																								handleChange={(element) =>
																									formik.setFieldValue(
																										`acls.${index}.role`,
																										element.value
																									)
																								}
																								placeholder={t(
																									"USERS.ACLS.NEW.ACCESS.ROLES.LABEL"
																								)}
																								tabIndex={index + 1}
																								disabled={!isAccess}
																							/>
																						</td>
																						<td className="fit text-center">
																							<Field
																								type="checkbox"
																								name={`acls.${index}.read`}
																							/>
																						</td>
																						<td className="fit text-center">
																							<Field
																								type="checkbox"
																								name={`acls.${index}.write`}
																							/>
																						</td>
																						{aclActions.length > 0 &&
																							(isAccess ? (
																								<td className="fit editable">
																									<div>
																										<Field
																											name={`acls.${index}.actions`}
																											fieldInfo={{
																												id: `acls.${index}.actions`,
																												type: "mixed_text",
																												collection: aclActions,
																											}}
																											onlyCollectionValues
																											component={
																												RenderMultiField
																											}
																										/>
																									</div>
																								</td>
																							) : (
																								<td className="fit">
																									{/*repeat for each additional action*/}
																									{formik.values.acls[
																										index
																									].actions.map(
// @ts-expect-error TS(7006): Parameter 'action' implicitly has an 'any' type.
																										(action, key) => (
																											<div key={key}>
																												{action.value}
																											</div>
																										)
																									)}
																								</td>
																							))}
																						{/*Remove policy*/}
																						{isAccess && (
																							<td>
																								<button
																									onClick={() => remove(index)}
																									className="button-like-anchor remove"
																								/>
																							</td>
																						)}
																					</tr>
																				))
																			) : (
																				<tr>
																					<td>
																						{t(
																							"USERS.ACLS.NEW.ACCESS.ROLES.EMPTY"
																						)}
																					</td>
																				</tr>
																			)}

																			{isAccess && (
																				<tr>
																					{/*Add additional policy row*/}
																					<td colSpan={5}>
																						<button
																							onClick={() => {
																								push({
																									role: "",
																									read: false,
																									write: false,
																									actions: [],
																								});
																								checkAcls(formik.values.acls);
																							}}
                                              className="button-like-anchor"
																						>
																							{" "}
																							+{" "}
																							{t(
																								"USERS.ACLS.NEW.ACCESS.ACCESS_POLICY.NEW"
																							)}
																						</button>
																					</td>
																				</tr>
																			)}
																		</>
																	)}
																</FieldArray>
															</tbody>
														</table>
													</div>
												</div>
											</div>
										</div>
									</div>
								</li>
							</ul>
						)}
					</div>
				</div>
			</div>
			{/* Button for navigation to next page and previous page */}
			{!isEdit && (
				<>
					<footer>
						<button
							type="submit"
							className={cn("submit", {
								active: formik.dirty && formik.isValid,
								inactive: !(formik.dirty && formik.isValid),
							})}
							disabled={!(formik.dirty && formik.isValid)}
							onClick={async () => {
								if (await checkAcls(formik.values.acls)) {
									nextPage(formik.values);
								}
							}}
// @ts-expect-error TS(2322): Type 'string' is not assignable to type 'number'.
							tabIndex="100"
						>
							{t("WIZARD.NEXT_STEP")}
						</button>
						<button
							className="cancel"
							onClick={() => previousPage(formik.values, false)}
// @ts-expect-error TS(2322): Type 'string' is not assignable to type 'number'.
							tabIndex="101"
						>
							{t("WIZARD.BACK")}
						</button>
					</footer>

					<div className="btm-spacer" />
				</>
			)}
		</>
	);
};

// Getting state data out of redux store
// @ts-expect-error TS(7006): Parameter 'state' implicitly has an 'any' type.
const mapStateToProps = (state) => ({
	user: getUserInformation(state),
});

// @ts-expect-error TS(7006): Parameter 'dispatch' implicitly has an 'any' type.
const mapDispatchToProps = (dispatch) => ({
// @ts-expect-error TS(7006): Parameter 'acls' implicitly has an 'any' type.
	checkAcls: (acls) => dispatch(checkAcls(acls)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AclAccessPage);
